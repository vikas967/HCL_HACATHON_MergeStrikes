/**
 * Document ingestion: extract → chunk → embed → store.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { PolicyDocument } from '../models/PolicyDocument.js';
import { PolicyChunk } from '../models/PolicyChunk.js';
import { embedBatch } from '../ai/embeddingService.js';

export async function extractText(filePath, mimeType, originalName) {
  const ext = (path.extname(originalName || filePath) || '').toLowerCase();
  if (ext === '.pdf' || mimeType === 'application/pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const buf = await fs.readFile(filePath);
      const result = await pdfParse(buf);
      return result.text || '';
    } catch (err) {
      console.error('[rag] pdf-parse failed:', err.message);
      return '';
    }
  }
  if (ext === '.json') {
    const raw = await fs.readFile(filePath, 'utf8');
    try {
      const obj = JSON.parse(raw);
      return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    } catch {
      return raw;
    }
  }
  return fs.readFile(filePath, 'utf8');
}

/**
 * Split text into ~400-token chunks respecting paragraph & heading boundaries.
 */
export function chunkText(text, { minChars = 300, maxChars = 1200 } = {}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  let current = '';
  let currentSection = '';
  const sectionRegex = /^(#{1,6}\s+.+|[A-Z][A-Z0-9 \-]{3,}:?)$/;

  for (const para of paragraphs) {
    const firstLine = para.split('\n')[0];
    if (sectionRegex.test(firstLine.trim()) && firstLine.length < 100) {
      if (current.length >= minChars) {
        chunks.push({ text: current.trim(), section: currentSection });
        current = '';
      }
      currentSection = firstLine.replace(/^#+\s*/, '').replace(/:$/, '').trim();
    }
    if (current.length + para.length + 2 > maxChars && current.length >= minChars) {
      chunks.push({ text: current.trim(), section: currentSection });
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) chunks.push({ text: current.trim(), section: currentSection });
  return chunks.length ? chunks : [{ text: text.trim(), section: '' }];
}

export async function ingestDocument({ title, docType, version, effectiveDate, region, sourceFileName, text }) {
  const doc = await PolicyDocument.create({
    title,
    docType,
    version: version || '1.0',
    effectiveDate: effectiveDate || new Date(),
    applicableRegion: region || 'global',
    sourceFileName,
    chunkCount: 0,
  });

  const chunks = chunkText(text);
  const embeddings = await embedBatch(chunks.map((c) => c.text));
  const docs = chunks.map((c, i) => ({
    document: doc._id,
    chunkIndex: i,
    section: c.section,
    text: c.text,
    embedding: embeddings[i],
    metadata: {
      docType,
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      region: doc.applicableRegion,
      title: doc.title,
    },
  }));
  if (docs.length) await PolicyChunk.insertMany(docs, { ordered: false });

  doc.chunkCount = docs.length;
  await doc.save();
  return doc;
}
