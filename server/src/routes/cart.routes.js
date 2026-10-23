import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, applyPromo } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:itemId', updateItem);
router.delete('/items/:itemId', removeItem);
router.post('/promo', applyPromo);
export default router;
