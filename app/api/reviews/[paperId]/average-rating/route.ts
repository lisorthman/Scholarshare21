import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import mongoose from 'mongoose'; // Import mongoose

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    await connectDB();
    
    // Await the params - it's now a Promise
    const { paperId } = await params;
    
    // Calculate average rating
    const result = await Review.aggregate([
      {
        $match: { 
          paperId: new mongoose.Types.ObjectId(paperId) 
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" }
        }
      }
    ]);

    const average = result[0]?.average || 0;
    
    return NextResponse.json({ average });
    
  } catch (err) {
    console.error('Error calculating average rating:', err);
    return NextResponse.json(
      { average: 0, error: 'Failed to calculate rating' },
      { status: 500 }
    );
  }
}