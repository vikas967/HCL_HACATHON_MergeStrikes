import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsmart_ai';
  try {
    await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB: ${uri.replace(/\/\/[^@]*@/, '//<credentials>@')}`);
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  }
}
