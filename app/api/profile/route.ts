import { NextResponse } from 'next/server';
import User from '@/models/user';
import connectDB from "@/lib/mongoose";

export async function GET(request: Request) {
  await connectDB();

  const token = request.headers.get('authorization')?.split(' ')[1] || 
                new URL(request.url).searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    // Verify the token
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const verifyData = await verifyResponse.json();
    
    // Allow both admin and researcher roles
    if (!verifyData.valid || !['admin', 'researcher'].includes(verifyData.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch the user from the database
    const user = await User.findOne({ _id: verifyData.user._id });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}