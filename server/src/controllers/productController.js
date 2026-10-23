import { Product } from '../models/Product.js';
import { Inventory } from '../models/Inventory.js';
import { HttpError } from '../middleware/error.js';
import { compareProducts } from '../ai/shoppingAssistant.js';

export async function listProducts(req, res, next) {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      available,
      sort = 'relevance',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(String(brand), 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (available === 'true') query.available = true;
    if (q) query.$text = { $search: String(q) };

    const sortSpec =
      sort === 'price_asc'
        ? { price: 1 }
        : sort === 'price_desc'
        ? { price: -1 }
        : sort === 'rating'
        ? { rating: -1, reviewCount: -1 }
        : sort === 'newest'
        ? { createdAt: -1 }
        : q
        ? { score: { $meta: 'textScore' } }
        : { rating: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      items,
      page: pageNum,
      pageSize: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) throw new HttpError(404, 'Product not found');
    const inventories = await Inventory.find({ product: product._id }).populate('warehouse').lean();
    const totalAvailable = inventories.reduce(
      (s, i) => s + Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0)),
      0
    );
    res.json({
      product,
      inventory: {
        totalAvailable,
        byWarehouse: inventories.map((i) => ({
          warehouse: i.warehouse?.name,
          available: Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0)),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function compare(req, res, next) {
  try {
    const { productIds = [], context = '' } = req.body || {};
    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
      throw new HttpError(400, 'Provide 2 or 3 productIds to compare');
    }
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    if (products.length !== productIds.length) throw new HttpError(404, 'One or more products not found');
    const ordered = productIds.map((id) => products.find((p) => String(p._id) === String(id))).filter(Boolean);
    const result = await compareProducts(ordered, context);
    res.json({ products: ordered, comparison: result });
  } catch (err) {
    next(err);
  }
}

export async function recommendations(req, res, next) {
  try {
    const { category, maxPrice, minRating = 4 } = req.query;
    const query = { available: true, rating: { $gte: Number(minRating) } };
    if (category) query.category = category;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };
    const items = await Product.find(query).sort({ rating: -1, reviewCount: -1 }).limit(8).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
