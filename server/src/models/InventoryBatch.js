import mongoose from 'mongoose';

const inventoryBatchSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    batchCode: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    manufacturedOn: { type: Date },
    expiresOn: { type: Date, required: true, index: true },
    status: { type: String, enum: ['active', 'quarantined', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

export const InventoryBatch = mongoose.model('InventoryBatch', inventoryBatchSchema);
