import connectToDB from '@/lib/mongoose';
import Milestone from '@/models/Milestone';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await connectToDB();

    // Simulate logged-in researcher ID (replace with actual authentication logic)
    const researcherId = '12345';

    // Fetch milestones for the researcher
    const milestones = await Milestone.find({ researcherId }).sort({ date: 1 });
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}