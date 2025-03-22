// app/api/send-otp/route.ts

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  const { email } = await request.json();

  // Validate input
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = client.db('scholarshare');
  const usersCollection = db.collection('users');

  // Generate a 5-digit OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  // Set expiry time (2 minutes from now)
  const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  // Save the OTP and expiry time in the database
  await usersCollection.updateOne(
    { email },
    { $set: { verificationCode: otp, verificationCodeExpiry: expiryTime } },
    { upsert: true }
  );

  client.close();

  // Return the expiry time to the frontend
  return NextResponse.json(
    { message: 'OTP sent successfully', expiry: expiryTime.toISOString() },
    { status: 200 }
  );
}