import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app password
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
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

    // Generate a 5-digit verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Insert new user with verification code
    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role, // Store the selected role
      verificationCode,
      verificationCodeExpiry,
      isVerified: false, // User is not verified yet
    });

    // Send verification code via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // User's email
      subject: 'Email Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification code sent successfully');

    client.close();

    // Return success response
    return NextResponse.json(
      { message: 'User created! Verification code sent.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/signup:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}