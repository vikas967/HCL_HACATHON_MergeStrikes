import { Router } from 'express';
import { createOrder, myOrders, getOrder } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.post('/', createOrder);
router.get('/my', myOrders);
router.get('/:id', getOrder);
export default router;
