// app/api/milestones/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import { calculateAndSyncMilestones } from '@/lib/milestoneCalculator';
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

    // Calculate milestones and sync badges
    const result = await calculateAndSyncMilestones(userId);

    // Validate the returned data structure
    if (!result || 
        !Array.isArray(result.milestones) || 
        !Array.isArray(result.newBadges)) {
      throw new Error('Invalid data structure returned from milestone calculation');
    }

    // Transform milestones for the client
    const transformedMilestones = result.milestones.map(milestone => ({
      ...milestone,
      progress: Math.round(milestone.progress * 100) / 100 // Round to 2 decimal places
    }));

    return NextResponse.json({
      success: true,
      data: {
        milestones: transformedMilestones,
        newBadges: result.newBadges,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60',
        'CDN-Cache-Control': 'public, s-maxage=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
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