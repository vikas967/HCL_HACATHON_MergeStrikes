import { Router } from 'express';
import { upload, uploadMiddleware, list, detail, remove } from '../controllers/policyController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.get('/', list);
router.get('/:id', detail);
router.post('/upload', requireAuth, requireAdmin, uploadMiddleware, upload);
router.delete('/:id', requireAuth, requireAdmin, remove);
export default router;
