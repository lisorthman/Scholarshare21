import { NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { paperIds } = await req.json();

    if (!paperIds || !Array.isArray(paperIds)) {
      return NextResponse.json(
        { error: 'Invalid paper IDs provided' },
        { status: 400 }
      );
    }

    const papers = await ResearchPaper.find({
      _id: { $in: paperIds },
      status: 'approved' // Only fetch approved papers
    })
    .populate('author', 'name email')
    .populate('categoryDetails', 'name description')
    .lean();

    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error fetching bulk papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}