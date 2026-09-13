import * as paymentService from '../services/paymentService.js';

export async function processPayment(req, res, next) {
  try {
    const { orderId, idempotencyKey, forceOutcome } = req.body;
    if (!orderId || !idempotencyKey) {
      return res.status(400).json({ error: 'orderId and idempotencyKey are required' });
    }
    res.json(await paymentService.processPayment({ orderId, idempotencyKey, forceOutcome }));
  } catch (err) { next(err); }
}