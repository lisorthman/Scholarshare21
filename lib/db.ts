// lib/db.ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarshare';
const options = {};

let client: MongoClient;
let db: Db;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

export async function getDb() {
  if (!db) {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    const mongoClient = await global._mongoClientPromise;
    db = mongoClient.db(); // default db in URI or 'test'
  }
  return db;
}
