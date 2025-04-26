// app/api/user/track-view/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/user';
import connectToDB from '@/lib/mongoose';

export async function POST(request: Request) {
  try {
    await connectToDB();
    
    const { userId, paperId } = await request.json();

    if (!userId || !paperId) {
      return NextResponse.json(
        { error: 'User ID and Paper ID are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update recently viewed
    const existingIndex = user.recentlyViewed.findIndex(
      (item: any) => item.paperId.toString() === paperId
    );

    if (existingIndex !== -1) {
      // Update timestamp if already exists
      user.recentlyViewed[existingIndex].timestamp = Date.now();
    } else {
      // Add new entry
      user.recentlyViewed.push({
        paperId,
        timestamp: Date.now()
      });
    }

    // Keep only the last 20 viewed papers
    user.recentlyViewed = user.recentlyViewed
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, 20);

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking paper view:', error);
    return NextResponse.json(
      { error: 'Failed to track paper view' },
      { status: 500 }
    );
  }
}