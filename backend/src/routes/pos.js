import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts);

export default router;