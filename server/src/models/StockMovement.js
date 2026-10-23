import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    type: {
      type: String,
      enum: ['adjustment', 'reservation', 'release', 'fulfilment', 'return'],
      required: true,
    },
    delta: { type: Number, required: true },
    reason: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reference: { type: String },
  },
  { timestamps: true }
);

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
