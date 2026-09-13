import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

router.post('/products', productController.createProduct);
router.get('/products/:category?', productController.getAllProducts);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

export default router;