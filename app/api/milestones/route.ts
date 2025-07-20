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

    // Get user to verify they have researcher role
    const user = await User.findById(userId).select('role').lean() as { role: string } | null;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all papers uploaded by this researcher
    const allUserPapers = await ResearchPaper.find({
      authorId: userId
    }).select('status downloads downloadCount createdAt').lean();

    // Calculate accurate counts based on roles:
    // - Uploads: Papers uploaded by researcher role (all papers by this user)
    // - Approvals: Papers that have been approved by admin role (status: 'approved')
    // - Downloads: Sum of downloads from approved papers only
    
    const uploadCount = allUserPapers.length; // Total papers uploaded by researcher
    const approvedPapers = allUserPapers.filter(paper => paper.status === 'approved');
    const approvalCount = approvedPapers.length; // Papers approved by admin
    const totalDownloads = approvedPapers.reduce((sum, paper) => 
      sum + (paper.downloads || paper.downloadCount || 0), 0
    );

    // Update user's counts in database to ensure accuracy before milestone calculation
    await User.findByIdAndUpdate(userId, {
      'counts.uploads': uploadCount,
      'counts.approvals': approvalCount, 
      'counts.downloads': totalDownloads
    });

    // Calculate milestones and sync badges with updated counts
    const result = await calculateAndSyncMilestones(userId);

    // Validate the returned data structure
    if (!result || 
        !Array.isArray(result.milestones) || 
        !Array.isArray(result.newBadges)) {
      throw new Error('Invalid data structure returned from milestone calculation');
    }

    // Get paper downloads breakdown for approved papers only
    const paperDownloads = approvedPapers.map((paper: any) => ({
      paperId: paper._id.toString(),
      title: paper.title,
      count: paper.downloads || paper.downloadCount || 0
    })).sort((a, b) => b.count - a.count); // Sort by download count descending

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
        actualCounts: {
          uploads: uploadCount,
          approvals: approvalCount,
          downloads: totalDownloads
        },
        userRole: user.role,
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