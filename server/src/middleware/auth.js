import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from './error.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Missing authentication token');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.sub).lean();
    if (!user) throw new HttpError(401, 'User not found');
    req.user = { id: String(user._id), email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new HttpError(401, 'Authentication required'));
  if (req.user.role !== 'admin') return next(new HttpError(403, 'Admin access required'));
  next();
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.sub).lean();
    if (user) req.user = { id: String(user._id), email: user.email, role: user.role, name: user.name };
  } catch {
    /* ignore */
  }
  next();
}
