import { NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function GET(
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

    const paper = await ResearchPaper.findById(id);

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    if (!paper.fileUrl) {
      return NextResponse.json(
        { error: 'Download URL not available for this paper' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: paper.fileUrl
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    );
  }
}