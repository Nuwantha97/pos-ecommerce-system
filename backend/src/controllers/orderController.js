import * as orderService from '../services/orderService.js';

export async function checkout(req, res, next) {
  try {
    const { cartId, items, idempotencyKey } = req.body;

    if (!cartId || !Array.isArray(items) || items.length === 0 || !idempotencyKey) {
      return res.status(400).json({ error: 'cartId, items[], and idempotencyKey are required' });
    }

    const result = await orderService.checkout({ cartId, items, idempotencyKey });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}