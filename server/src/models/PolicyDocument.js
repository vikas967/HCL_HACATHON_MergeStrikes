import mongoose from 'mongoose';

const policyDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    docType: {
      type: String,
      enum: ['return', 'refund', 'shipping', 'warranty', 'membership', 'manual', 'seller', 'other'],
      required: true,
      index: true,
    },
    version: { type: String, default: '1.0' },
    effectiveDate: { type: Date, default: Date.now },
    applicableRegion: { type: String, default: 'global' },
    sourceFileName: { type: String },
    chunkCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

export const PolicyDocument = mongoose.model('PolicyDocument', policyDocumentSchema);
