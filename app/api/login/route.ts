import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  // Validate input
  if (!email || !password || !role) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Connect to MongoDB
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const usersCollection = db.collection('users');

    // Find user by email and role
    const user = await usersCollection.findOne({ email, role });
    if (!user) {
      client.close();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      client.close();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    client.close();
    return NextResponse.json({ message: 'Login successful!', token }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}