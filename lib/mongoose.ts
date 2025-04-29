import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not defined in environment');
}

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    console.log("Using existing DB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new DB connection");
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI must be a defined string');
    }

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'scholarshare',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    }).then(mongoose => {
      console.log("DB connection established");
      return mongoose;
    }).catch(err => {
      console.error("DB connection failed:", err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("DB connection error:", err);
    throw err;
  }

  return cached.conn;
}

export default connectDB;
