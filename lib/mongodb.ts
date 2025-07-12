import mongoose, { ConnectOptions, Connection } from 'mongoose';

// Type definition for our connection object
interface MongoConnection {
  isConnected?: number;
  conn?: typeof mongoose;
  promise?: Promise<typeof mongoose>;
}

// Global variable to cache the connection
const mongoConnection: MongoConnection = {};

/**
 * Connect to MongoDB with caching and retry logic
 * @returns Promise<mongoose.Connection>
 */
export async function connectToDB(): Promise<typeof mongoose> {
  // Check if we already have a cached connection
  if (mongoConnection.isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoConnection.conn!;
  }

  // Check if we're already connecting
  if (mongoConnection.promise) {
    return mongoConnection.promise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable not set');
  }

  try {
    // Create new connection promise
    mongoConnection.promise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    } as ConnectOptions);

    // Wait for connection to complete
    const conn = await mongoConnection.promise;

    // Cache the connection
    mongoConnection.conn = conn;
    mongoConnection.isConnected = conn.connections[0].readyState;

    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    // Clear the promise on failure to allow retries
    mongoConnection.promise = undefined;
    throw error;
  }
}

// For backward compatibility
export default connectToDB;