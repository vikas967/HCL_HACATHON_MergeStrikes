/**
 * Centralized Gemini service — the ONLY module that initializes a Gemini
 * text-generation client. Every AI-powered feature must call these helpers.
 *
 * The API key never leaves the backend. If the key is missing or the call
 * fails, helpers return `{ ok: false, reason }` so callers can fall back to
 * deterministic behavior.
 */

let _client = null;
let _loadAttempted = false;

async function getClient() {
  if (_client || _loadAttempted) return _client;
  _loadAttempted = true;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[gemini] GEMINI_API_KEY not set — AI features will use fallbacks.');
    return null;
  }
  try {
    const mod = await import('@google/genai');
    const GoogleGenAI = mod.GoogleGenAI || mod.default?.GoogleGenAI || mod.default;
    _client = new GoogleGenAI({ apiKey });
    return _client;
  } catch (err) {
    console.error('[gemini] Failed to initialize client:', err.message);
    return null;
  }
}

function withTimeout(promise, ms, label = 'gemini') {
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

export async function geminiIsAvailable() {
  const c = await getClient();
  return Boolean(c);
}

/**
 * Generate a plain text completion.
 * Returns { ok: true, text } or { ok: false, reason }.
 */
export async function generateText({ system, prompt, temperature = 0.4, maxOutputTokens = 1024 } = {}) {
  const client = await getClient();
  if (!client) return { ok: false, reason: 'gemini_unavailable' };
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const timeout = Number(process.env.GEMINI_TIMEOUT_MS || 30000);
  try {
    const config = {
      temperature,
      maxOutputTokens,
      ...(system ? { systemInstruction: system } : {}),
    };
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: prompt,
        config,
      }),
      timeout,
      'gemini.generateText'
    );
    const text = extractText(response);
    return { ok: true, text };
  } catch (err) {
    console.error('[gemini] generateText failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

/**
 * Generate structured JSON output.
 * Returns { ok: true, data } or { ok: false, reason }.
 */
export async function generateJSON({ system, prompt, temperature = 0.2, maxOutputTokens = 1024 } = {}) {
  const client = await getClient();
  if (!client) return { ok: false, reason: 'gemini_unavailable' };
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const timeout = Number(process.env.GEMINI_TIMEOUT_MS || 30000);
  const sys =
    (system ? system + '\n\n' : '') +
    'Respond with ONLY a valid JSON object. No markdown fences, no commentary, no prose.';
  try {
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens,
          systemInstruction: sys,
          responseMimeType: 'application/json',
        },
      }),
      timeout,
      'gemini.generateJSON'
    );
    const text = extractText(response);
    const data = safeParseJSON(text);
    if (!data) return { ok: false, reason: 'invalid_json', text };
    return { ok: true, data };
  } catch (err) {
    console.error('[gemini] generateJSON failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

function extractText(response) {
  if (!response) return '';
  if (typeof response.text === 'string') return response.text;
  if (typeof response.text === 'function') return response.text();
  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('').trim();
}

function safeParseJSON(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
