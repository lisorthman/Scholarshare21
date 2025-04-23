import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  let client;

  try {
    const { name, email, password, role } = await request.json();

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Connect to MongoDB
    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Check for existing user
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP once
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Insert user with verification data
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationCode,
      verificationCodeExpiry,
      resendAttempts: 0,
      failedAttempts: 0,
      createdAt: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, name, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Log the Gmail username, OTP, and token to the terminal
    console.log('User Registered:');
    console.log('Gmail Username:', email);
    console.log('OTP:', verificationCode);
    console.log('Generated Token:', token);

    return NextResponse.json(
      { message: 'User created. Verification code sent.', token },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in /api/signup:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) client.close();
  }
}