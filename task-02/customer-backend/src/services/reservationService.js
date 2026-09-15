import { Op } from 'sequelize';
import sequelize from '../database/database.js';
import { Product, Order, Reservation } from '../models/index.js';
import { assertTransition, ORDER_STATUSES } from './orderStateMachine.js';

export async function releaseReservationsForOrder(orderId, t, fromStatus = 'reserved', toStatus = 'released') {
  const reservations = await Reservation.findAll({
    where: { order_id: orderId, status: fromStatus },
    lock: t.LOCK.UPDATE,
    transaction: t
  });
  for (const r of reservations) {
    await Product.increment('stock', { by: r.quantity, where: { id: r.product_id }, transaction: t });
    r.status = toStatus;
    await r.save({ transaction: t });
  }
}

export async function expireSingleOrder(orderId) {
  await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    // Order gone or already transitioned away from 'reserved'
    if (!order || order.status !== ORDER_STATUSES.RESERVED) return;

    // Not yet expired
    if (order.expires_at >= new Date()) return;

    assertTransition(order.status, ORDER_STATUSES.EXPIRED);
    order.status = ORDER_STATUSES.EXPIRED;
    await order.save({ transaction: t });

    await releaseReservationsForOrder(orderId, t);
  });
}

export async function expireStaleReservations() {
  const staleOrders = await Order.findAll({
    where: {
      status: ORDER_STATUSES.RESERVED,
      expires_at: { [Op.lt]: new Date() }
    },
    attributes: ['id']
  });

  for (const { id } of staleOrders) {
    try {
      await expireSingleOrder(id);
    } catch (err) {
      // Log and continue — don't let one order block the sweep
      console.error(`Failed to expire order ${id}:`, err);
    }
  }
}