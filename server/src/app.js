import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import orderRoutes from './routes/order.routes.js';
import aiRoutes from './routes/ai.routes.js';
import policyRoutes from './routes/policy.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const aiLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/ai', aiLimiter);
app.use('/api/admin/ai', aiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/routes', (_req, res) => {
  res.json({
    auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
    products: [
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/products/compare',
      'GET /api/products/recommendations',
    ],
    ai: ['POST /api/ai/shopping-assistant', 'POST /api/ai/policies/ask', 'POST /api/ai/checkout-assistant'],
    cart: ['GET /api/cart', 'POST /api/cart/items', 'PATCH /api/cart/items/:itemId', 'DELETE /api/cart/items/:itemId'],
    wishlist: ['GET /api/wishlist', 'POST /api/wishlist/:productId', 'DELETE /api/wishlist/:productId'],
    checkout: ['POST /api/checkout/validate', 'POST /api/orders'],
    orders: ['GET /api/orders/my', 'GET /api/orders/:id'],
    policies: ['POST /api/policies/upload', 'GET /api/policies', 'GET /api/policies/:id', 'DELETE /api/policies/:id'],
    admin: [
      'GET /api/admin/operations/overview',
      'GET /api/admin/inventory',
      'GET /api/admin/inventory/low-stock',
      'GET /api/admin/inventory/forecast',
      'GET /api/admin/inventory/expiry',
      'POST /api/admin/inventory/adjust',
      'GET /api/admin/operations/fulfilment-exceptions',
      'GET /api/admin/promotions',
      'POST /api/admin/promotions',
      'PATCH /api/admin/promotions/:id',
      'POST /api/admin/ai/operations-assistant',
    ],
  });
});

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
