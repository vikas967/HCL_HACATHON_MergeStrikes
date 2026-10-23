import { Router } from 'express';
import { validate, createOrder } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.post('/validate', validate);
router.post('/', createOrder);
export default router;
