import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');
    const passwordResetCollection = db.collection('passwordResets');

    // Optional: Verify that a password reset was initiated for this email
    const resetRecord = await passwordResetCollection.findOne({
      email: normalizedEmail,
    });

    if (!resetRecord) {
      return NextResponse.json(
        { message: 'No password reset request found for this email' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    const result = await usersCollection.updateOne(
      { email: normalizedEmail },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'User not found or password not updated' },
        { status: 404 }
      );
    }

    // Delete the reset record so OTP can't be reused
    await passwordResetCollection.deleteOne({ email: normalizedEmail });

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}