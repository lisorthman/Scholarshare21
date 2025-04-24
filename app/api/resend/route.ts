import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const MAX_RESEND_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 2;

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

    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Initialize resendAttempts if not set
    const resendAttempts = user.resendAttempts || 0;

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      return NextResponse.json({
        message: 'Maximum resend attempts reached. Please try again later.',
      }, { status: 429 });
    }

    // Generate new OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Update OTP and increment resendAttempts
    await usersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          verificationCode: otp,
          verificationCodeExpiry: expiryTime,
        },
        $inc: { resendAttempts: 1 },
      }
    );

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Verification',
      text: `Your new verification code is: ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'OTP resent successfully',
      expiry: expiryTime.toISOString(),
      attemptsLeft: MAX_RESEND_ATTEMPTS - (resendAttempts + 1),
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  } finally {
    await client.close();
  }
}
