import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Inventory } from '../models/Inventory.js';
import { Order } from '../models/Order.js';
import { Promotion } from '../models/Promotion.js';
import { StockMovement } from '../models/StockMovement.js';
import { HttpError } from '../middleware/error.js';

export const SHIPPING_FLAT = 49;
export const FREE_SHIPPING_THRESHOLD = 999;

export function computeShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export async function getCartForUser(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

export async function priceCart(cart) {
  const items = cart.items
    .filter((i) => i.product)
    .map((i) => ({
      _id: i._id,
      productId: String(i.product._id),
      product: {
        id: String(i.product._id),
        name: i.product.name,
        price: i.product.price,
        originalPrice: i.product.originalPrice,
        image: i.product.image,
        brand: i.product.brand,
        category: i.product.category,
      },
      quantity: i.quantity,
      lineTotal: i.product.price * i.quantity,
    }));

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  let discount = 0;
  let promotion = null;
  if (cart.promoCode) {
    const promo = await Promotion.findOne({ code: cart.promoCode, enabled: true });
    if (promo && promo.endsAt > new Date() && promo.startsAt <= new Date() && subtotal >= promo.minOrderValue) {
      if (promo.discountType === 'percent') {
        discount = (subtotal * promo.discountValue) / 100;
        if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
      } else {
        discount = promo.discountValue;
      }
      promotion = { code: promo.code, description: promo.description, discount: Number(discount.toFixed(2)) };
    }
  }
  const shipping = computeShipping(subtotal - discount);
  const total = Math.max(0, subtotal - discount) + shipping;
  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    shipping,
    total: Number(total.toFixed(2)),
    promotion,
    promoCode: cart.promoCode,
  };
}

export async function validateCheckout(userId) {
  const cart = await getCartForUser(userId);
  if (!cart.items.length) throw new HttpError(400, 'Cart is empty');

  const issues = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.available) {
      issues.push({ productId: item.product?._id, issue: 'unavailable' });
      continue;
    }
    const inventories = await Inventory.find({ product: product._id });
    const totalAvailable = inventories.reduce(
      (s, i) => s + Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0)),
      0
    );
    if (totalAvailable < item.quantity) {
      issues.push({
        productId: product._id,
        name: product.name,
        requested: item.quantity,
        available: totalAvailable,
        issue: 'insufficient_stock',
      });
    }
  }
  const summary = await priceCart(cart);
  return { summary, issues };
}

/**
 * Place an order with atomic stock reservation across warehouses.
 */
export async function placeOrder({ userId, shippingAddress }) {
  const cart = await getCartForUser(userId);
  if (!cart.items.length) throw new HttpError(400, 'Cart is empty');

  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const items = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(session);
        if (!product || !product.available) throw new HttpError(400, `${item.product.name} unavailable`);

        let remaining = item.quantity;
        const inventories = await Inventory.find({ product: product._id }).session(session).sort({ onHand: -1 });
        const allocations = [];
        for (const inv of inventories) {
          if (remaining <= 0) break;
          const avail = Math.max(0, inv.onHand - inv.reserved - inv.unavailable);
          if (avail <= 0) continue;
          const take = Math.min(avail, remaining);
          inv.onHand -= take;
          await inv.save({ session });
          allocations.push({ warehouse: inv.warehouse, qty: take });
          remaining -= take;
        }
        if (remaining > 0) throw new HttpError(409, `Insufficient stock for ${product.name}`);

        for (const alloc of allocations) {
          items.push({
            product: product._id,
            nameSnapshot: product.name,
            skuSnapshot: product.sku,
            priceSnapshot: product.price,
            quantity: alloc.qty,
            warehouse: alloc.warehouse,
          });
          await StockMovement.create(
            [
              {
                product: product._id,
                warehouse: alloc.warehouse,
                type: 'fulfilment',
                delta: -alloc.qty,
                reason: 'order fulfilment',
                performedBy: userId,
              },
            ],
            { session }
          );
        }
      }

      const pricing = await priceCart(cart);
      const orderNumber = `OSA-${Date.now().toString(36).toUpperCase()}`;
      const [created] = await Order.create(
        [
          {
            orderNumber,
            user: userId,
            items,
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            shipping: pricing.shipping,
            total: pricing.total,
            promoCode: cart.promoCode,
            status: 'confirmed',
            shippingAddress,
          },
        ],
        { session }
      );
      order = created;

      cart.items = [];
      cart.promoCode = null;
      await cart.save({ session });
    });
    return order;
  } finally {
    session.endSession();
  }
}
