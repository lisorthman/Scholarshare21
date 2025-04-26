// app/api/admin/papers/route.ts
import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectDB from '@/lib/mongoose';


export async function GET() {
  try {
    await connectDB();
    const papers = await ResearchPaper.find({ status: 'pending' });
    return NextResponse.json({ papers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pending papers' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { paperId, status } = await req.json();
    
    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { status },
      { new: true }
    );
    
    return NextResponse.json({ paper: updatedPaper });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update paper status' },
      { status: 500 }
    );
  }
}