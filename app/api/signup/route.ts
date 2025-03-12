import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { name, email, phoneNumber, password, role } = await request.json();

  // Validate input
  if (!name || !email || !phoneNumber || !password || !role) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = client.db();
  const usersCollection = db.collection('users');

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    client.close();
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const result = await usersCollection.insertOne({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
    role,
  });

  client.close();
  return NextResponse.json({ message: 'User created!', userId: result.insertedId }, { status: 201 });
}