import { Router } from 'express';
import { listProducts, getProduct, compare, recommendations } from '../controllers/productController.js';

const router = Router();
router.get('/', listProducts);
router.get('/recommendations', recommendations);
router.post('/compare', compare);
router.get('/:id', getProduct);
export default router;
