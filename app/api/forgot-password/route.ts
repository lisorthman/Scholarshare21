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

    // Check if user exists
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store OTP in passwordReset collection
    const passwordResetCollection = db.collection('passwordResets');
    await passwordResetCollection.updateOne(
      { email: normalizedEmail },
      { $set: { otp, expiry: expiryTime } },
      { upsert: true }
    );

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}\nThis code expires in 15 minutes.`,
      html: `
        <div>
          <h2>Password Reset Request</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: 'OTP sent to your email',
        expiry: expiryTime.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return NextResponse.json(
      { message: 'Failed to send password reset OTP' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}