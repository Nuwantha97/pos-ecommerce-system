import sequelize from '../database/database.js';
import { Product, Order, OrderItem, Reservation } from '../models/index.js';
import InsufficientStockError from '../errors/InsufficientStockError.js';
import DuplicateSubmissionError from '../errors/DuplicateSubmissionError.js';

const RESERVATION_TTL_MS = 5 * 60 * 1000;

export async function checkout({ cartId, items, idempotencyKey }) {
  // idempotency check OUTSIDE the transaction first — cheap short-circuit
  const existing = await Order.findOne({ where: { idempotency_key: idempotencyKey } });
  if (existing) {
    return { orderId: existing.id, expiresAt: existing.expires_at, duplicate: true };
  }

  return sequelize.transaction(async (t) => {
    // lock every product row involved, in a stable order (by id) to avoid deadlocks
    const productIds = items.map(i => i.productId).sort((a, b) => a - b);
    const products = await Product.findAll({
      where: { id: productIds },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // validate stock for ALL items before mutating anything
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new InsufficientStockError(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for ${product.name}: requested ${item.quantity}, available ${product.stock}`
        );
      }
    }

    // all validated — now decrement and create records
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

    const order = await Order.create({
      cart_id: cartId,
      status: 'reserved',
      idempotency_key: idempotencyKey,
      expires_at: expiresAt,
      total: items.reduce((sum, i) => sum + productMap.get(i.productId).price * i.quantity, 0)
    }, { transaction: t });

    for (const item of items) {
      const product = productMap.get(item.productId);

      product.stock -= item.quantity;
      await product.save({ transaction: t });

      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: product.price
      }, { transaction: t });

      await Reservation.create({
        product_id: item.productId,
        quantity: item.quantity,
        status: 'reserved',
        expires_at: expiresAt,
        cart_id: cartId,
        order_id: order.id
      }, { transaction: t });
    }

    return { orderId: order.id, expiresAt };
  });
}