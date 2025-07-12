import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { paperId: string } }
) {
  try {
    await connectDB();
    
    const { paperId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      return NextResponse.json(
        { error: 'Invalid paper ID' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ 
      paperId: new mongoose.Types.ObjectId(paperId) 
    })
    .sort({ createdAt: -1 }) // Newest first
    .lean(); // Convert to plain JavaScript objects

    return NextResponse.json(reviews);
    
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}