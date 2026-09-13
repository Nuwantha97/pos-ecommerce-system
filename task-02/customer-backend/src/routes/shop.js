import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

router.post('/carts/:cartId/checkout', orderController.checkout);
router.post('/payments', paymentController.processPayment);

router.get('/orders', orderController.getOrdersByCustomer);
router.get('/orders/:id', orderController.getOrderById);
router.patch('/orders/:id/cancel', orderController.cancelOrder);
router.post('/orders/:id/refund', orderController.refundOrder);

export default router;