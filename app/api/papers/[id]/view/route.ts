import { NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = params; // Destructure after awaiting

    if (!id) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedPaper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: updatedPaper.views
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}