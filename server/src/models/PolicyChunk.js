import mongoose from 'mongoose';

const policyChunkSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'PolicyDocument', required: true, index: true },
    section: { type: String, default: '' },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

policyChunkSchema.index({ document: 1, chunkIndex: 1 }, { unique: true });

export const PolicyChunk = mongoose.model('PolicyChunk', policyChunkSchema);
