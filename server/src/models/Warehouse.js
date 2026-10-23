import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    region: { type: String },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
