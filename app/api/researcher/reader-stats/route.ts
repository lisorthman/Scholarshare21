import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function GET() {
  await connectMongo();

  const papers = await ResearchPaper.find();

  const aggregated: Record<string, Record<string, number>> = {}; // category -> year -> count

  papers.forEach(paper => {
    const category = paper.category || 'Uncategorized';
    const stats = paper.readerStats || {};

    for (const [year, count] of stats.entries()) {
      if (!aggregated[category]) aggregated[category] = {};
      aggregated[category][year] = (aggregated[category][year] || 0) + count;
    }
  });

  return NextResponse.json(aggregated);
}
