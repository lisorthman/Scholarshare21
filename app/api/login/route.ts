import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  console.log('Login API called'); // Debugging

  const { email, password, role } = await request.json();
  console.log('Received data:', { email, password, role }); // Debugging

  // Validate input
  if (!email || !password || !role) {
    console.log('Validation failed: All fields are required'); // Debugging
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Connect to MongoDB
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB'); // Debugging

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find user by email and role
    const user = await usersCollection.findOne({ email, role });
    if (!user) {
      console.log('User not found:', email); // Debugging
      client.close();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email); // Debugging
      client.close();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    console.log('Token generated:', token); // Debugging

    client.close();
    return NextResponse.json({ message: 'Login successful!', token }, { status: 200 });
  } catch (error) {
    console.error('Error:', error); // Debugging
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}