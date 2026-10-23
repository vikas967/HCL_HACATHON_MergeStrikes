import { z } from 'zod';
import { validateCheckout, placeOrder } from '../orders/orderService.js';
import { Order } from '../models/Order.js';
import { HttpError } from '../middleware/error.js';

export async function validate(req, res, next) {
  try {
    const result = await validateCheckout(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

const placeOrderSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(2),
    line1: z.string().min(3),
    line2: z.string().optional().default(''),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4).max(10),
    phone: z.string().min(6).max(15),
  }),
});

export async function createOrder(req, res, next) {
  try {
    const data = placeOrderSchema.parse(req.body);
    const order = await placeOrder({ userId: req.user.id, shippingAddress: data.shippingAddress });
    res.status(201).json({ order });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ items: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) throw new HttpError(404, 'Order not found');
    if (String(order.user) !== req.user.id && req.user.role !== 'admin') {
      throw new HttpError(403, 'Not allowed');
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}
