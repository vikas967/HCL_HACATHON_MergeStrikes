import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    onHand: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    unavailable: { type: Number, required: true, min: 0, default: 0 },
    reorderPoint: { type: Number, default: 10 },
    targetStockLevel: { type: Number, default: 50 },
  },
  { timestamps: true }
);

inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

inventorySchema.virtual('available').get(function () {
  return Math.max(0, this.onHand - this.reserved - this.unavailable);
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);
