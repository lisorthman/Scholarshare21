// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import connectToDB from '@/lib/mongoose';
import { seedMilestoneConfig } from '@/lib/seedMilestoneConfig';

// Call this once when your app starts
seedMilestoneConfig();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    await connectToDB();

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Find user without password
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean() as { _id: string; name: string; email: string; role: string; counts?: { uploads: number; approvals: number; downloads: number }; badges?: string[] } | null;

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        counts: user.counts || { uploads: 0, approvals: 0, downloads: 0 },
        badges: user.badges || []
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}