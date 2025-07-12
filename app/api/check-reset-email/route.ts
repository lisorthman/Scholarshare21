import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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

    // For security, don't reveal if email doesn't exist
    return NextResponse.json(
      { 
        message: 'If this email exists, you can proceed with password reset',
        exists: !!user 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { message: 'Failed to check email' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}