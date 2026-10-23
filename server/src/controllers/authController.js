import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/error.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn });
}

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new HttpError(409, 'Email already registered');
    const passwordHash = await User.hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'user',
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await user.verifyPassword(data.password);
    if (!ok) throw new HttpError(401, 'Invalid credentials');
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    if (err?.issues) return next(new HttpError(400, 'Validation failed', err.flatten?.() || err.issues));
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
