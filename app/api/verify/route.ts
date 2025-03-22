// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    // Validate input
    if (!email || !code) {
      return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const usersCollection = db.collection('users');

    // Find the user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      client.close();
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the code matches and is not expired
    if (user.verificationCode !== code || new Date() > user.verificationCodeExpiry) {
      client.close();
      return NextResponse.json({ message: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark the user as verified
    await usersCollection.updateOne(
      { email },
      { $set: { isVerified: true }, $unset: { verificationCode: 1, verificationCodeExpiry: 1 } }
    );

    // Generate a new token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    client.close();

    // Return the token and role
    return NextResponse.json(
      { message: 'User verified successfully', token, role: user.role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/verify:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}