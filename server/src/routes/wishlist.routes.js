import { Router } from 'express';
import { list, add, remove } from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', list);
router.post('/:productId', add);
router.delete('/:productId', remove);
export default router;
