import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    skuSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'allocated', 'shipped', 'delivered', 'cancelled', 'fulfilment_exception'],
      default: 'confirmed',
      index: true,
    },
    exceptionReason: { type: String, default: null },
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
