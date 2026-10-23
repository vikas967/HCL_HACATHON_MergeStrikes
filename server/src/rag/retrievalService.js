/**
 * Retrieval service — vector similarity search over policy chunks.
 *
 * Prefers MongoDB Atlas Vector Search (`VECTOR_STORE_MODE=atlas`), falls back
 * to in-memory cosine similarity for local development.
 */
import { PolicyChunk } from '../models/PolicyChunk.js';
import { embedText, cosineSimilarity } from '../ai/embeddingService.js';

const mode = () => (process.env.VECTOR_STORE_MODE || 'local').toLowerCase();

export async function retrieveRelevantChunks(query, { topK = 5, filter = {} } = {}) {
  const queryEmbedding = await embedText(query);
  if (mode() === 'atlas') {
    return retrieveWithAtlas(queryEmbedding, topK, filter);
  }
  return retrieveLocal(queryEmbedding, topK, filter);
}

async function retrieveLocal(queryEmbedding, topK, filter) {
  const query = {};
  if (filter.docType) query['metadata.docType'] = filter.docType;
  if (filter.region) query['metadata.region'] = { $in: [filter.region, 'global'] };
  const chunks = await PolicyChunk.find(query).populate('document').lean();
  const scored = chunks
    .map((c) => ({
      ...c,
      score: cosineSimilarity(queryEmbedding, c.embedding || []),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored;
}

async function retrieveWithAtlas(queryEmbedding, topK, filter) {
  // Expects a Vector Search index named "policy_vector_index" on policyChunks.embedding
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: 'policy_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(topK * 10, 50),
          limit: topK,
          ...(filter.docType ? { filter: { 'metadata.docType': filter.docType } } : {}),
        },
      },
      { $addFields: { score: { $meta: 'vectorSearchScore' } } },
      {
        $lookup: {
          from: 'policydocuments',
          localField: 'document',
          foreignField: '_id',
          as: 'document',
        },
      },
      { $unwind: '$document' },
    ];
    return await PolicyChunk.aggregate(pipeline);
  } catch (err) {
    console.warn('[rag] Atlas Vector Search failed, falling back to local:', err.message);
    return retrieveLocal(queryEmbedding, topK, filter);
  }
}
