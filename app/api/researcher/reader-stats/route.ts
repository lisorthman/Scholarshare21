// app/api/researcher/reader-stats/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get('researcherId');
    
    if (!researcherId) {
      return NextResponse.json({ error: 'Researcher ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get all papers by this researcher
    const papers = await ResearchPaper.find({ authorId: researcherId });

    // Group by category and year
    const stats: Record<string, Record<string, number>> = {};
    
    papers.forEach(paper => {
      const category = paper.category;
      const year = new Date(paper.createdAt).getFullYear().toString();
      
      if (!stats[category]) {
        stats[category] = {};
      }
      
      if (!stats[category][year]) {
        stats[category][year] = 0;
      }
      
      // Add views for this paper
      stats[category][year] += paper.views || 0;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[READER STATS ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 