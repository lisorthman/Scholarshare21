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

    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Find user by email (case-insensitive)
    const user = await usersCollection.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
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

    // Update lastLogin
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    console.log('Updated lastLogin:', updateResult.modifiedCount); // Debugging

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    console.log('Token generated:', token); // Debugging

    client.close();
    return NextResponse.json({ message: 'Login successful!', token ,role: user.role }, { status: 200 });
  } catch (error) {
    console.error('Error:', error); // Debugging
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}