import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import { isValidObjectId } from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate user ID format
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid user ID is required',
          details: userId ? 'Invalid ID format' : 'Missing user ID'
        },
        { status: 400 }
      );
    }

    await connectToDB();

    // Get all approved papers by this user with their download counts
    const papers = await ResearchPaper.find({
      authorId: userId,
      status: 'approved'
    })
    .select('title downloads downloadCount')
    .sort({ downloads: -1 }) // Sort by downloads descending
    .lean();

    // Transform data for the frontend
    const paperDownloads = papers.map(paper => ({
      paperId: paper._id.toString(),
      title: paper.title,
      count: paper.downloads || paper.downloadCount || 0
    }));

    return NextResponse.json({
      success: true,
      data: paperDownloads
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Paper Downloads API Error]', errorMessage, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : undefined) : 
          undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
