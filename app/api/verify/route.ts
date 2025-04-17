import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
  }

  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.verificationCode !== code || new Date() > user.verificationCodeExpiry) {
      // Increment failed attempts
      await usersCollection.updateOne(
        { email },
        { $inc: { failedAttempts: 1 } }
      );

      const updatedUser = await usersCollection.findOne({ email });
      if (updatedUser && updatedUser.failedAttempts >= 15) {
        // Delete the user after 10 failed attempts
        await usersCollection.deleteOne({ email });
        return NextResponse.json({
          message: 'Max attempts reached. Your account has been deleted.',
        }, { status: 400 });
      }

      return NextResponse.json({
        message: `Invalid or expired code. You have ${15 - (updatedUser?.failedAttempts || 0)} attempts left before account deletion.`,
      }, { status: 400 });
    }

    // Mark user as verified
    await usersCollection.updateOne(
      { email },
      { $set: { isVerified: true }, $unset: { verificationCode: 1, verificationCodeExpiry: 1, failedAttempts: 1 } }
    );

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'User verified successfully',
      token,
      role: user.role,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/verify:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
