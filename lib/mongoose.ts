import mongoose from 'mongoose';
import User from '../models/user'; // Relative path from /lib to /models
import ResearchPaper from '../models/ResearchPaper';

// Explicitly reference the models to suppress TS(6133) and ensure registration
const ensureModelsRegistered = () => {
  if (!mongoose.models.User) {
    console.log('Registering User model');
    User;
  }
  if (!mongoose.models.ResearchPaper) {
    console.log('Registering ResearchPaper model');
    ResearchPaper;
  }
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not defined in environment');
}

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    console.log('Using existing DB connection');
    console.log('User model registered:', !!mongoose.models.User);
    console.log('ResearchPaper model registered:', !!mongoose.models.ResearchPaper);
    console.log('All registered models:', Object.keys(mongoose.models));
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new DB connection');
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI must be a defined string');
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'scholarshare',
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      })
      .then((mongoose) => {
        console.log('DB connection established');
        ensureModelsRegistered(); // Ensure models are registered after connection
        console.log('User model registered:', !!mongoose.models.User);
        console.log('ResearchPaper model registered:', !!mongoose.models.ResearchPaper);
        console.log('All registered models:', Object.keys(mongoose.models));
        return mongoose;
      })
      .catch((err) => {
        console.error('DB connection failed:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log('User model registered after connection:', !!mongoose.models.User);
    console.log('ResearchPaper model registered after connection:', !!mongoose.models.ResearchPaper);
    console.log('All registered models after connection:', Object.keys(mongoose.models));
  } catch (err) {
    cached.promise = null;
    console.error('DB connection error:', err);
    throw err;
  }

  return cached.conn;
}

export default connectDB;