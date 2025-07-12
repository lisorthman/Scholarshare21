// app/api/researcher/stats/route.ts
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

    // Calculate totals
    const totalDownloads = papers.reduce((sum, paper) => sum + (paper.downloads || 0), 0);
    const totalViews = papers.reduce((sum, paper) => sum + (paper.views || 0), 0);
    const uniqueDownloads = papers.reduce((sum, paper) => sum + (paper.downloadedBy?.length || 0), 0);
    const uniqueViews = papers.reduce((sum, paper) => sum + (paper.viewedBy?.length || 0), 0);

    // Find most viewed category
    const categoryStats: Record<string, number> = {};
    papers.forEach(paper => {
      categoryStats[paper.category] = (categoryStats[paper.category] || 0) + (paper.views || 0);
    });
    const mostViewedCategory = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Calculate weekly percentage changes
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get current week stats (last 7 days)
    const currentWeekDownloads = papers.reduce((sum, paper) => {
      const lastDownloadTime = paper.updatedAt; // Using updatedAt as proxy for last activity
      if (lastDownloadTime && new Date(lastDownloadTime) >= oneWeekAgo) {
        return sum + (paper.downloads || 0);
      }
      return sum;
    }, 0);

    const currentWeekViews = papers.reduce((sum, paper) => {
      const lastViewTime = paper.updatedAt; // Using updatedAt as proxy for last activity
      if (lastViewTime && new Date(lastViewTime) >= oneWeekAgo) {
        return sum + (paper.views || 0);
      }
      return sum;
    }, 0);

    // Get previous week stats (7-14 days ago)
    const previousWeekDownloads = papers.reduce((sum, paper) => {
      const lastDownloadTime = paper.updatedAt;
      if (lastDownloadTime && new Date(lastDownloadTime) >= twoWeeksAgo && new Date(lastDownloadTime) < oneWeekAgo) {
        return sum + (paper.downloads || 0);
      }
      return sum;
    }, 0);

    const previousWeekViews = papers.reduce((sum, paper) => {
      const lastViewTime = paper.updatedAt;
      if (lastViewTime && new Date(lastViewTime) >= twoWeeksAgo && new Date(lastViewTime) < oneWeekAgo) {
        return sum + (paper.views || 0);
      }
      return sum;
    }, 0);

    // Calculate percentage changes
    const downloadPercentageChange = previousWeekDownloads > 0 
      ? ((currentWeekDownloads - previousWeekDownloads) / previousWeekDownloads * 100).toFixed(1)
      : currentWeekDownloads > 0 ? '100.0' : '0.0';

    const viewPercentageChange = previousWeekViews > 0 
      ? ((currentWeekViews - previousWeekViews) / previousWeekViews * 100).toFixed(1)
      : currentWeekViews > 0 ? '100.0' : '0.0';

    return NextResponse.json({
      totalDownloads,
      totalViews,
      uniqueDownloads,
      uniqueViews,
      mostViewedCategory,
      paperCount: papers.length,
      downloadPercentageChange: parseFloat(downloadPercentageChange),
      viewPercentageChange: parseFloat(viewPercentageChange)
    });
  } catch (error) {
    console.error('[RESEARCHER STATS ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}