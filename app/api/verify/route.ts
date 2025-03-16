// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  // Validate input
  if (!email || !code) {
    return NextResponse.json({ message: 'code is required' }, { status: 400 });
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

  client.close();
  return NextResponse.json({ message: 'User verified successfully' }, { status: 200 });
}