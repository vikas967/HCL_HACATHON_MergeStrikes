/**
 * Centralized Gemini embedding service. Only module that calls the embedding
 * endpoint. Falls back to deterministic hash-based pseudo-embeddings when the
 * Gemini key is unavailable (clearly labelled so RAG still demos without API
 * access, though with lower quality).
 */
import crypto from 'node:crypto';

let _client = null;
let _loadAttempted = false;

async function getClient() {
  if (_client || _loadAttempted) return _client;
  _loadAttempted = true;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const mod = await import('@google/genai');
    const GoogleGenAI = mod.GoogleGenAI || mod.default?.GoogleGenAI || mod.default;
    _client = new GoogleGenAI({ apiKey });
    return _client;
  } catch (err) {
    console.error('[embedding] Failed to initialize client:', err.message);
    return null;
  }
}

const DIM = 384;

export async function embedText(text) {
  const result = await embedBatch([text]);
  return result[0];
}

export async function embedBatch(texts) {
  const client = await getClient();
  const model = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  if (!client) {
    return texts.map((t) => pseudoEmbed(t));
  }
  const timeout = Number(process.env.GEMINI_TIMEOUT_MS || 30000);
  const out = [];
  for (const text of texts) {
    try {
      const resp = await withTimeout(
        client.models.embedContent({ model, contents: text }),
        timeout,
        'embedding'
      );
      const values =
        resp?.embeddings?.[0]?.values ||
        resp?.embedding?.values ||
        resp?.values ||
        null;
      if (!values || !Array.isArray(values)) {
        console.warn('[embedding] Unexpected shape, falling back for one chunk');
        out.push(pseudoEmbed(text));
      } else {
        out.push(values);
      }
    } catch (err) {
      console.error('[embedding] call failed, using fallback:', err.message);
      out.push(pseudoEmbed(text));
    }
  }
  return out;
}

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}: timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Deterministic fallback — hashes tokens into a sparse vector. Not as good as
 * real embeddings but keeps RAG demonstrable without a key.
 */
export function pseudoEmbed(text) {
  const vec = new Array(DIM).fill(0);
  const tokens = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (const token of tokens) {
    const hash = crypto.createHash('sha1').update(token).digest();
    for (let i = 0; i < 4; i++) {
      const idx = hash.readUInt32BE(i * 4) % DIM;
      vec[idx] += 1 / Math.sqrt(tokens.length || 1);
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosineSimilarity(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
