import { z } from 'zod';
import { operationsOverview, listInventory, listLowStock, adjustStock } from '../inventory/inventoryService.js';
import { listExpiringBatches } from '../inventory/expiryService.js';
import { listForecasts, computeForecast } from '../inventory/forecastService.js';
import { Order } from '../models/Order.js';
import { Promotion } from '../models/Promotion.js';
import { answerOpsQuestion } from '../ai/opsAssistant.js';
import { HttpError } from '../middleware/error.js';

export async function overview(_req, res, next) {
  try {
    const [ops, expiring, lowStock] = await Promise.all([
      operationsOverview(),
      listExpiringBatches(),
      listLowStock(),
    ]);
    const exceptionCount = await Order.countDocuments({ status: 'fulfilment_exception' });
    res.json({
      ...ops,
      nearExpiryBatches: expiring.filter((b) => b.daysToExpiry > 0).length,
      expiredBatches: expiring.filter((b) => b.daysToExpiry <= 0).length,
      lowStockItems: lowStock.length,
      fulfilmentExceptions: exceptionCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function inventory(req, res, next) {
  try {
    const items = await listInventory({ warehouseId: req.query.warehouseId, lowStockOnly: req.query.lowOnly === 'true' });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function lowStock(_req, res, next) {
  try {
    const items = await listLowStock();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function forecasts(req, res, next) {
  try {
    if (req.query.productId) {
      const f = await computeForecast(req.query.productId);
      return res.json(f);
    }
    const items = await listForecasts({ limit: Number(req.query.limit || 20) });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function expiry(_req, res, next) {
  try {
    const items = await listExpiringBatches();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

const adjustSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  delta: z.number().int(),
  reason: z.string().min(3).max(200),
});

export async function adjust(req, res, next) {
  try {
    const data = adjustSchema.parse(req.body);
    const result = await adjustStock({ ...data, performedBy: req.user.id });
    res.json({ inventory: result });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

export async function fulfilmentExceptions(_req, res, next) {
  try {
    const orders = await Order.find({ status: 'fulfilment_exception' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: orders });
  } catch (err) {
    next(err);
  }
}

export async function listPromotions(_req, res, next) {
  try {
    const items = await Promotion.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

const promoCreateSchema = z.object({
  code: z.string().min(3).max(32),
  description: z.string().optional().default(''),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime(),
  enabled: z.boolean().default(true),
});

export async function createPromotion(req, res, next) {
  try {
    const data = promoCreateSchema.parse(req.body);
    const promo = await Promotion.create({
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      endsAt: new Date(data.endsAt),
    });
    res.status(201).json({ promotion: promo });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    if (err.code === 11000) return next(new HttpError(409, 'Promo code already exists'));
    next(err);
  }
}

const promoPatchSchema = promoCreateSchema.partial();

export async function updatePromotion(req, res, next) {
  try {
    const data = promoPatchSchema.parse(req.body);
    const update = { ...data };
    if (data.startsAt) update.startsAt = new Date(data.startsAt);
    if (data.endsAt) update.endsAt = new Date(data.endsAt);
    const promo = await Promotion.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!promo) throw new HttpError(404, 'Promotion not found');
    res.json({ promotion: promo });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

const opsAssistantSchema = z.object({ question: z.string().min(2).max(400) });

export async function opsAssistant(req, res, next) {
  try {
    const { question } = opsAssistantSchema.parse(req.body);
    const result = await answerOpsQuestion(question);
    res.json(result);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}
