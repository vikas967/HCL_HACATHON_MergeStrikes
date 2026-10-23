import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { PolicyDocument } from '../models/PolicyDocument.js';
import { PolicyChunk } from '../models/PolicyChunk.js';
import { extractText, ingestDocument } from '../rag/documentProcessor.js';
import { HttpError } from '../middleware/error.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE = Number(process.env.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.md', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new HttpError(400, `File type ${ext} not allowed`));
    cb(null, true);
  },
}).single('file');

export async function upload(req, res, next) {
  try {
    if (!req.file) throw new HttpError(400, 'No file uploaded');
    const { title, docType = 'other', version = '1.0', region = 'global' } = req.body || {};
    if (!title) throw new HttpError(400, 'title is required');
    const text = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    if (!text || text.length < 20) throw new HttpError(400, 'Could not extract readable text from file');
    const doc = await ingestDocument({
      title,
      docType,
      version,
      region,
      sourceFileName: req.file.originalname,
      text,
    });
    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
}

export async function list(_req, res, next) {
  try {
    const docs = await PolicyDocument.find({ status: 'active' }).sort({ updatedAt: -1 }).lean();
    res.json({ items: docs });
  } catch (err) {
    next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const doc = await PolicyDocument.findById(req.params.id).lean();
    if (!doc) throw new HttpError(404, 'Document not found');
    const chunks = await PolicyChunk.find({ document: doc._id }).sort({ chunkIndex: 1 }).lean();
    res.json({
      document: doc,
      chunks: chunks.map((c) => ({ section: c.section, chunkIndex: c.chunkIndex, preview: c.text.slice(0, 300) })),
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await PolicyDocument.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'Document not found');
    await PolicyChunk.deleteMany({ document: doc._id });
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
