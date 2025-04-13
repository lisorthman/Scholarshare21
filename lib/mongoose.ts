// app/lib/mongoose.ts
import mongoose from 'mongoose';

// Server-side only check
if (typeof window !== 'undefined') {
  throw new Error('Mongoose cannot be used in client-side code');
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not defined');
}
let cached = global.mongoose || { conn: null, promise: null };
let isConnected=false;

export async function connectDB() {
  if (isConnected) {
    return mongoose;
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'scholarshare',
      serverSelectionTimeoutMS: 5000,
    }).then(mongoose => mongoose);

    if (process.env.NODE_ENV === 'development') {
      global.mongoose = cached;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;

  
}
// Option 1: Export connectDB as default
export default connectDB; 