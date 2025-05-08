import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import Paper from '@/models/paper';
import { calculateMilestones } from '@/lib/milestoneCalculator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    await connectToDB();

    // Fetch all papers by the researcher
    const papers = await Paper.find({ authorId: userId })
      .select('_id status downloads createdAt')
      .lean();

    // Calculate milestones based on papers
    const milestones = calculateMilestones(papers);

    return NextResponse.json(milestones);

  } catch (error) {
    console.error('Error in milestones API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}