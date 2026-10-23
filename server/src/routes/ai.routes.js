import { Router } from 'express';
import { shoppingAssistant, policyAsk, checkoutAdvisor } from '../controllers/aiController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();
router.post('/shopping-assistant', optionalAuth, shoppingAssistant);
router.post('/policies/ask', optionalAuth, policyAsk);
router.post('/checkout-assistant', requireAuth, checkoutAdvisor);
export default router;
