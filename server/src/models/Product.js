import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: 'text' },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    brand: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    image: { type: String, default: '' },
    gallery: [String],
    available: { type: Boolean, default: true },
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String, index: true }],
    useCases: [String],
    perishable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

export const Product = mongoose.model('Product', productSchema);
