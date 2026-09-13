import * as orderService from '../services/orderService.js';

export async function checkout(req, res, next) {
  try {
    const { items, customerId, idempotencyKey } = req.body;
    const { cartId } = req.params;
    if (!Array.isArray(items) || items.length === 0 || !idempotencyKey) {
      return res.status(400).json({ error: 'items[] and idempotencyKey are required' });
    }
    const result = await orderService.checkout({ cartId, items, customerId, idempotencyKey });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function getOrdersByCustomer(req, res, next) {
  try {
    const { customerId } = req.query;
    if (!customerId) return res.status(400).json({ error: 'customerId query param is required' });
    res.json(await orderService.getOrdersByCustomer(customerId));
  } catch (err) { next(err); }
}

export async function getOrderById(req, res, next) {
  try {
    res.json(await orderService.getOrderById(req.params.id));
  } catch (err) { next(err); }
}

export async function cancelOrder(req, res, next) {
  try {
    res.json(await orderService.cancelOrder(req.params.id));
  } catch (err) { next(err); }
}

export async function refundOrder(req, res, next) {
  try {
    res.json(await orderService.refundOrder(req.params.id));
  } catch (err) { next(err); }
}