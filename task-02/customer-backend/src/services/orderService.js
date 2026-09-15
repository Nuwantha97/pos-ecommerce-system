import sequelize from '../database/database.js';
import { Product, Order, OrderItem, Reservation } from '../models/index.js';
import { assertTransition, ORDER_STATUSES } from './orderStateMachine.js';
import { releaseReservationsForOrder, expireSingleOrder } from './reservationService.js';
import InsufficientStockError from '../middleware/errorHandler.js';

export async function checkout({ cartId, items, customerId, idempotencyKey }) {
  const existing = await Order.findOne({ where: { idempotency_key: idempotencyKey } });
  if (existing) {
    return { orderId: existing.id, expiresAt: existing.expires_at, duplicate: true };
  }

  return sequelize.transaction(async (t) => {
    const productIds = items.map(i => i.productId).sort((a, b) => a - b);
    const products = await Product.findAll({
      where: { id: productIds },
      lock: t.LOCK.UPDATE,
      transaction: t
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new InsufficientStockError(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(`Insufficient stock for ${product.name}`);
      }
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const order = await Order.create({
      cart_id: cartId,
      customerId: customerId ?? null,
      status: ORDER_STATUSES.RESERVED,
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

export async function getOrdersByCustomer(customerId) {
  return Order.findAll({
    where: { customerId: customerId },
    include: [{ model: OrderItem }],
    order: [['created_at', 'DESC']]
  });
}

export async function getOrderById(id) {
  // Lazy expiry: ensure stale reservation is expired before returning
  await expireSingleOrder(id);

  const order = await Order.findByPk(id, {
    include: [{
      model: OrderItem,
      include: [{
        model: Product,
        attributes: ['id', 'name']
      }]
    }]
  });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  return order;
}

export async function cancelOrder(id) {
  // Lazy expiry: if past TTL, expire before attempting cancel
  await expireSingleOrder(id);

  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }
    assertTransition(order.status, ORDER_STATUSES.CANCELLED);
    await releaseReservationsForOrder(id, t);
    order.status = ORDER_STATUSES.CANCELLED;
    await order.save({ transaction: t });
    return order;
  });
}

export async function refundOrder(id) {
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }
    assertTransition(order.status, ORDER_STATUSES.REFUNDED);
    order.status = ORDER_STATUSES.REFUNDED;
    await order.save({ transaction: t });
    return order;
  });
}