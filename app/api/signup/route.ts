import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  console.log('Signup API called'); // Debugging

  const { name, email, phoneNumber, password, role } = await request.json();
  console.log('Received data:', { name, email, phoneNumber, password, role }); // Debugging

  // Validate input
  if (!name || !email || !phoneNumber || !password || !role) {
    console.log('Validation failed: All fields are required'); // Debugging
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Connect to MongoDB
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB'); // Debugging

    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser); // Debugging
      client.close();
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed'); // Debugging

    // Insert new user
    const result = await usersCollection.insertOne({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });
    console.log('User inserted:', result.insertedId); // Debugging

    client.close();
    return NextResponse.json({ message: 'User created!', userId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error); // Debugging
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}