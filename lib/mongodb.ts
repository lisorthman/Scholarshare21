import { MongoClient } from 'mongodb';

// Type assertion for environment variable
const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = 'scholarshare';

if (!MONGODB_URI) {
  throw new Error('Define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}