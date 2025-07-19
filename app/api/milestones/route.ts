// app/api/milestones/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import { calculateAndSyncMilestones } from '@/lib/milestoneCalculator';
import { isValidObjectId } from 'mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import User from '@/models/user';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const downloadsOnly = searchParams.get('downloadsOnly') === 'true';

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

    // Calculate milestones and sync badges
    const result = await calculateAndSyncMilestones(userId);

    // Validate the returned data structure
    if (!result || 
        !Array.isArray(result.milestones) || 
        !Array.isArray(result.newBadges)) {
      throw new Error('Invalid data structure returned from milestone calculation');
    }

    // Get paper downloads breakdown and calculate total
    const papers = await ResearchPaper.find({
      authorId: userId,
      status: 'approved'
    })
    .select('title downloads downloadCount')
    .sort({ downloads: -1 })
    .lean();

    const paperDownloads = papers.map((paper: any) => ({
      paperId: paper._id.toString(),
      title: paper.title,
      count: paper.downloads || paper.downloadCount || 0
    }));

    // Calculate total downloads from all papers
    const totalDownloads = paperDownloads.reduce((sum, paper) => sum + paper.count, 0);

    // Update user's download count if it doesn't match the actual total
    const currentUserDownloads = result.userCounts?.downloads || 0;
    if (totalDownloads !== currentUserDownloads) {
      await User.findByIdAndUpdate(userId, {
        'counts.downloads': totalDownloads
      });
      
      // Recalculate milestones with updated download count
      const updatedResult = await calculateAndSyncMilestones(userId);
      result.milestones = updatedResult.milestones;
    }

    // Transform milestones for the client
    const transformedMilestones = result.milestones.map(milestone => ({
      ...milestone,
      progress: Math.round(milestone.progress * 100) / 100 // Round to 2 decimal places
    }));

    // If only downloads are requested, return just the downloads milestone
    if (downloadsOnly) {
      const downloadMilestone = transformedMilestones.find(m => m._id === 'downloads');
      return NextResponse.json({
        success: true,
        data: {
          downloadMilestone,
          paperDownloads
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        milestones: transformedMilestones,
        newBadges: result.newBadges,
        paperDownloads,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': forceRefresh ? 'no-cache' : 'public, s-maxage=60',
        'CDN-Cache-Control': forceRefresh ? 'no-cache' : 'public, s-maxage=60',
        'Vercel-CDN-Cache-Control': forceRefresh ? 'no-cache' : 'public, s-maxage=60'
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Milestones API Error]', errorMessage, error);
    
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}