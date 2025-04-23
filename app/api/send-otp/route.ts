import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    // Set expiry time (2 minutes from now)
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000);

    // Update user with new OTP
    await usersCollection.updateOne(
      { email: normalizedEmail },
      { $set: { verificationCode: otp, verificationCodeExpiry: expiryTime } },
      { upsert: false } // Only update existing users
    );

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Your New OTP Code',
      text: `Your new OTP is: ${otp}`,
    });

    console.log('Resent OTP:', otp);

    return NextResponse.json(
      {
        message: 'OTP resent successfully',
        expiry: expiryTime.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  } finally {
    await client.close();
  }
}