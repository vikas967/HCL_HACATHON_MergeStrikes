import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../middleware/error.js';

async function getWishlist(userId) {
  let wl = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wl) wl = await Wishlist.create({ user: userId, products: [] });
  return wl;
}

export async function list(req, res, next) {
  try {
    const wl = await getWishlist(req.user.id);
    res.json({ items: wl.products });
  } catch (err) {
    next(err);
  }
}

export async function add(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new HttpError(404, 'Product not found');
    const wl = await getWishlist(req.user.id);
    if (!wl.products.find((p) => String(p._id) === String(product._id))) wl.products.push(product._id);
    await wl.save();
    await wl.populate('products');
    res.json({ items: wl.products });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const wl = await getWishlist(req.user.id);
    wl.products = wl.products.filter((p) => String(p._id || p) !== String(req.params.productId));
    await wl.save();
    await wl.populate('products');
    res.json({ items: wl.products });
  } catch (err) {
    next(err);
  }
}
