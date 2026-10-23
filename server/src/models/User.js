import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    preferences: {
      budgetDefault: Number,
      favouriteCategories: [String],
    },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: String(this._id),
    email: this.email,
    name: this.name,
    role: this.role,
    preferences: this.preferences || {},
  };
};

export const User = mongoose.model('User', userSchema);
