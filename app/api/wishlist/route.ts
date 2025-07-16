// app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Wishlist from '@/models/Wishlist';
import ResearchPaper from '@/models/ResearchPaper';

export async function GET(request: Request) {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In a real app, verify token and get user ID
    const userId = token; // Replace with actual user ID from token
    
    // Get wishlist items with populated paper details
    const wishlistItems = await Wishlist.find({ userId })
      .populate({
        path: 'paperId',
        model: ResearchPaper,
        select: 'title authors abstract publicationDate downloadUrl thumbnailUrl downloadCount'
      });

    // Transform the data to match your frontend interface
    const papers = wishlistItems.map(item => ({
      id: item.paperId._id.toString(),
      title: item.paperId.title,
      authors: item.paperId.authors,
      abstract: item.paperId.abstract,
      publicationDate: item.paperId.publicationDate,
      downloadUrl: item.paperId.downloadUrl,
      thumbnailUrl: item.paperId.thumbnailUrl,
      downloadCount: item.paperId.downloadCount,
      // Add any other fields you need
    }));

    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}