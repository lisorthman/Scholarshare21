import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = client.db();
  const usersCollection = db.collection('users');

  // Fetch researcher-specific data (example: fetch all users)
  const users = await usersCollection.find({}).toArray();

  client.close();
  return NextResponse.json({ users }, { status: 200 });
}