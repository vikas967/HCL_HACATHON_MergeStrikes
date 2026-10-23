import mongoose from 'mongoose';

const historicalSalesSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    date: { type: Date, required: true, index: true },
    unitsSold: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

historicalSalesSchema.index({ product: 1, date: 1 }, { unique: true });

export const HistoricalSales = mongoose.model('HistoricalSales', historicalSalesSchema);
