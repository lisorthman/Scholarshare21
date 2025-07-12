import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: 'Email and OTP are required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db('scholarshare');
    const passwordResetCollection = db.collection('passwordResets');

    // Find the most recent OTP for this email
    const resetRecord = await passwordResetCollection.findOne({
      email: normalizedEmail,
    });

    if (!resetRecord) {
      return NextResponse.json(
        { message: 'No OTP found for this email' },
        { status: 404 }
      );
    }

    // Check if OTP matches and is not expired
    const now = new Date();
    if (resetRecord.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (now > new Date(resetRecord.expiry)) {
      return NextResponse.json(
        { message: 'OTP has expired' },
        { status: 400 }
      );
    }

    // OTP is valid - you might want to generate a token here for the next step
    // or just rely on the frontend to maintain the email in localStorage

    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}