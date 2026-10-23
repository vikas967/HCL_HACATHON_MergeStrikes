import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startsAt: { type: Date, default: () => new Date() },
    endsAt: { type: Date, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model('Promotion', promotionSchema);
