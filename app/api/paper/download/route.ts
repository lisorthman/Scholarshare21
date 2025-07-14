// /app/api/paper/download/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function POST(req: Request) {
  try {
    const { paperId } = await req.json();
    await connectDB();

    const paper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Download count updated' });
  } catch (error) {
    console.error('[DOWNLOAD ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
