// app/api/user/saved-papers/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/user';
import connectToDB from '@/lib/mongoose';

export async function GET(request: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).populate('savedPapers');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ papers: user.savedPapers });
  } catch (error) {
    console.error('Error fetching saved papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved papers' },
      { status: 500 }
    );
  }
}