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
    const passwordResetCollection = db.collection('passwordResets');

    // Generate new OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Update the reset record
    await passwordResetCollection.updateOne(
      { email: normalizedEmail },
      { $set: { otp, expiry: expiryTime } },
      { upsert: true }
    );

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'New Password Reset OTP',
      text: `Your new password reset OTP is: ${otp}\nThis code expires in 15 minutes.`,
    });

    console.log('Resent password reset OTP:', otp);

    return NextResponse.json(
      {
        message: 'New OTP sent successfully',
        expiry: expiryTime.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json(
      { message: 'Failed to resend OTP' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}