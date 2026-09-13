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

export async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}