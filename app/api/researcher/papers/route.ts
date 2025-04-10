import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Add proper validation
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      );
    }

    const papers = await ResearchPaper.find({ authorId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Error fetching research papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}