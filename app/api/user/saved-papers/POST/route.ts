// app/api/user/save-paper/route.ts
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

    // Toggle save status
    const paperIndex = user.savedPapers.indexOf(paperId);
    if (paperIndex === -1) {
      user.savedPapers.push(paperId);
    } else {
      user.savedPapers.splice(paperIndex, 1);
    }

    await user.save();

    return NextResponse.json({ 
      success: true,
      savedPapers: user.savedPapers 
    });
  } catch (error) {
    console.error('Error updating saved papers:', error);
    return NextResponse.json(
      { error: 'Failed to update saved papers' },
      { status: 500 }
    );
  }
}