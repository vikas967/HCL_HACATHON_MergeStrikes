import { z } from 'zod';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Promotion } from '../models/Promotion.js';
import { getCartForUser, priceCart } from '../orders/orderService.js';
import { HttpError } from '../middleware/error.js';

export async function getCart(req, res, next) {
  try {
    const cart = await getCartForUser(req.user.id);
    const summary = await priceCart(cart);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50).default(1),
});

export async function addItem(req, res, next) {
  try {
    const data = addItemSchema.parse(req.body);
    const product = await Product.findById(data.productId);
    if (!product || !product.available) throw new HttpError(404, 'Product unavailable');
    const cart = await getCartForUser(req.user.id);
    const existing = cart.items.find((i) => String(i.product?._id || i.product) === String(product._id));
    if (existing) existing.quantity = Math.min(50, existing.quantity + data.quantity);
    else cart.items.push({ product: product._id, quantity: data.quantity });
    await cart.save();
    await cart.populate('items.product');
    const summary = await priceCart(cart);
    res.json(summary);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

const updateItemSchema = z.object({ quantity: z.number().int().positive().max(50) });

export async function updateItem(req, res, next) {
  try {
    const data = updateItemSchema.parse(req.body);
    const cart = await getCartForUser(req.user.id);
    const item = cart.items.id(req.params.itemId);
    if (!item) throw new HttpError(404, 'Cart item not found');
    item.quantity = data.quantity;
    await cart.save();
    await cart.populate('items.product');
    const summary = await priceCart(cart);
    res.json(summary);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const cart = await getCartForUser(req.user.id);
    const item = cart.items.id(req.params.itemId);
    if (!item) throw new HttpError(404, 'Cart item not found');
    item.deleteOne();
    await cart.save();
    await cart.populate('items.product');
    const summary = await priceCart(cart);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

const promoSchema = z.object({ code: z.string().min(1).max(32).nullable() });
export async function applyPromo(req, res, next) {
  try {
    const data = promoSchema.parse(req.body);
    const cart = await getCartForUser(req.user.id);
    if (data.code) {
      const promo = await Promotion.findOne({ code: data.code.toUpperCase(), enabled: true });
      if (!promo || promo.endsAt < new Date()) throw new HttpError(400, 'Promo code is invalid or expired');
      cart.promoCode = promo.code;
    } else {
      cart.promoCode = null;
    }
    await cart.save();
    await cart.populate('items.product');
    const summary = await priceCart(cart);
    res.json(summary);
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}
