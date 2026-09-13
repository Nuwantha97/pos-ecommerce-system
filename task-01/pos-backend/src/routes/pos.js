import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/products/:category?', productController.getAllProducts);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.post('/products', productController.createProduct);

router.post('/checkout', orderController.checkout);
router.post('/payments', paymentController.processPayment);

router.patch('/orders/:id/cancel', orderController.cancelOrder);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders', orderController.getAllOrders);

export default router;