import { z } from 'zod';
import { extractIntent, searchCatalogue, explainMatches, answerFromPolicyContext } from '../ai/shoppingAssistant.js';
import { checkoutAssistant } from '../ai/opsAssistant.js';
import { retrieveRelevantChunks } from '../rag/retrievalService.js';
import { getCartForUser, priceCart } from '../orders/orderService.js';
import { HttpError } from '../middleware/error.js';

const shoppingSchema = z.object({
  query: z.string().min(2).max(500),
  context: z.record(z.any()).optional(),
});

export async function shoppingAssistant(req, res, next) {
  try {
    const { query } = shoppingSchema.parse(req.body);
    const intent = await extractIntent(query);
    if (intent.intent.clarifyingQuestion) {
      return res.json({
        intent: intent.intent,
        clarifyingQuestion: intent.intent.clarifyingQuestion,
        matches: [],
      });
    }
    const matches = await searchCatalogue(intent.intent, { limit: 5 });
    const explained = await explainMatches(intent.intent, matches);
    res.json({
      intent: intent.intent,
      matches: explained.map((m) => ({
        product: m.product,
        score: m.score,
        availableStock: m.availableStock,
        reasons: m.reasons,
        explanation: m.explanation,
      })),
      geminiAvailable: intent.ok,
    });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

const policySchema = z.object({
  question: z.string().min(3).max(500),
  docType: z.string().optional(),
});

export async function policyAsk(req, res, next) {
  try {
    const { question, docType } = policySchema.parse(req.body);
    const filter = docType ? { docType } : {};
    const chunks = await retrieveRelevantChunks(question, { topK: 5, filter });
    const result = await answerFromPolicyContext(question, chunks);
    res.json(result);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

const checkoutAssistSchema = z.object({ budget: z.number().optional() });

export async function checkoutAdvisor(req, res, next) {
  try {
    const { budget } = checkoutAssistSchema.parse(req.body);
    const cart = await getCartForUser(req.user.id);
    const priced = await priceCart(cart);
    const result = await checkoutAssistant({
      cartItems: priced.items,
      budget: budget || null,
    });
    res.json(result);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}
