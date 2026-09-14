import sequelize from '../database/database.js';
import { Order, Reservation, Payment, Product } from '../models/index.js';
import { canTransition } from './orderStateMachine.js';

function resolveOutcome(forceOutcome) {
  if (forceOutcome && ['success', 'failure', 'timeout'].includes(forceOutcome)) {
    return forceOutcome;
  }
  const roll = Math.random();
  if (roll < 0.7) return 'success';
  if (roll < 0.9) return 'failure';
  return 'timeout';
}

export async function processPayment({ orderId, idempotencyKey, forceOutcome }) {
  // idempotency check first - return cached result not double process
  const existingPayment = await Payment.findOne({ where: { idempotency_key: idempotencyKey } });
  if (existingPayment) {
    return { orderId, status: existingPayment.status, duplicate: true };
  }

  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { lock: t.LOCK.UPDATE, transaction: t });
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (!canTransition(order.status, 'paid') && !canTransition(order.status, 'failed') && !canTransition(order.status, 'expired')) {
      const err = new Error(`Cannot process payment for order in status "${order.status}"`);
      err.status = 409;
      throw err;
    }

    const outcome = resolveOutcome(forceOutcome);

    await Payment.create({
      order_id: orderId,
      status: outcome,
      idempotency_key: idempotencyKey,
      attempted_at: new Date()
    }, { transaction: t });

    if (outcome === 'success') {
      order.status = 'paid';
      await order.save({ transaction: t });
      await Reservation.update(
        { status: 'consumed' },
        { where: { order_id: orderId }, transaction: t }
      );
    } else if (outcome === 'failure') {
      order.status = 'failed';
      await order.save({ transaction: t });
      await releaseReservationsForOrder(orderId, 'released', t);
    } else if (outcome === 'timeout') {
      order.status = 'expired';
      await order.save({ transaction: t });
      await releaseReservationsForOrder(orderId, 'released', t);
    }

    return { orderId, status: outcome };
  });
}

async function releaseReservationsForOrder(orderId, newStatus, t) {
  const reservations = await Reservation.findAll({
    where: { order_id: orderId, status: 'reserved' },
    lock: t.LOCK.UPDATE,
    transaction: t
  });
  for (const r of reservations) {
    await Product.increment('stock', { by: r.quantity, where: { id: r.product_id }, transaction: t });
    r.status = newStatus;
    await r.save({ transaction: t });
  }
}