// app/api/researcher/reviews/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import Review from '@/models/review';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get('researcherId');
    
    if (!researcherId) {
      return NextResponse.json({ error: 'Researcher ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get all papers by this researcher
    const papers = await ResearchPaper.find({ authorId: researcherId }).select('_id title');
    
    if (papers.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // Get all paper IDs
    const paperIds = papers.map(paper => paper._id);

    // Fetch all reviews for these papers
    const reviews = await Review.find({ paperId: { $in: paperIds } })
      .sort({ createdAt: -1 })
      .limit(20) // Limit to 20 most recent reviews
      .lean();

    // Create a map of paper titles for easy lookup
    const paperTitleMap = papers.reduce((map, paper) => {
      map[paper._id.toString()] = paper.title;
      return map;
    }, {} as Record<string, string>);

    // Add paper title to each review
    const reviewsWithPaperTitles = reviews.map(review => ({
      ...review,
      paperTitle: paperTitleMap[(review as any).paperId.toString()] || 'Unknown Paper',
      _id: (review as any)._id.toString(),
      paperId: (review as any).paperId.toString(),
      createdAt: (review as any).createdAt.toISOString()
    }));

    return NextResponse.json({ reviews: reviewsWithPaperTitles });
  } catch (error) {
    console.error('[RESEARCHER REVIEWS ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 