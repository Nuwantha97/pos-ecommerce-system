export async function releaseReservationsForOrder(orderId, t) {
  const reservations = await Reservation.findAll({
    where: { order_id: orderId, status: 'reserved' },
    lock: t.LOCK.UPDATE,
    transaction: t
  });
  for (const r of reservations) {
    await Product.increment('stock', { by: r.quantity, where: { id: r.product_id }, transaction: t });
    r.status = 'released';
    await r.save({ transaction: t });
  }
}