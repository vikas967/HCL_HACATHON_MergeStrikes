import { Router } from 'express';
import {
  overview,
  inventory,
  lowStock,
  forecasts,
  expiry,
  adjust,
  fulfilmentExceptions,
  listPromotions,
  createPromotion,
  updatePromotion,
  opsAssistant,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/operations/overview', overview);
router.get('/operations/fulfilment-exceptions', fulfilmentExceptions);

router.get('/inventory', inventory);
router.get('/inventory/low-stock', lowStock);
router.get('/inventory/forecast', forecasts);
router.get('/inventory/expiry', expiry);
router.post('/inventory/adjust', adjust);

router.get('/promotions', listPromotions);
router.post('/promotions', createPromotion);
router.patch('/promotions/:id', updatePromotion);

router.post('/ai/operations-assistant', opsAssistant);

export default router;
