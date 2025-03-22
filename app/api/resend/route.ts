// app/api/resend/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app password
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Find the user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      client.close();
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate a new 5-digit verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Update the user with the new verification code and expiry time
    await usersCollection.updateOne(
      { email },
      { $set: { verificationCode, verificationCodeExpiry } }
    );

    // Send the new verification code via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // User's email
      subject: 'New Verification Code',
      text: `Your new verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('New verification code sent successfully');
    client.close();

    return NextResponse.json(
      { message: 'New verification code sent', expiry: verificationCodeExpiry },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/resend:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}