import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectDB from '@/lib/mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const paper = await ResearchPaper.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: paper.fileUrl,
      fileName: paper.fileName || `${paper.title.replace(/\s+/g, '_')}.pdf`
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}