import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Wishlist from '@/models/Wishlist';
import Paper from '@/models/paper';

export async function GET(request: Request) {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real app, you would verify the token and get the user ID
  const userId = token;

  try {
    // Get all wishlist items for the user
    const wishlistItems = await Wishlist.find({ userId });
    
    // Get all paper IDs from the wishlist
    const paperIds = wishlistItems.map(item => item.paperId);
    
    // Fetch all papers that are in the wishlist
    const papers = await Paper.find({ _id: { $in: paperIds }, status: 'approved' });
    
    // Map to the expected format
    const formattedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      publicationDate: paper.publicationDate,
      downloadUrl: paper.downloadUrl,
      thumbnailUrl: paper.thumbnailUrl,
      rating: paper.rating,
      averageRating: paper.averageRating,
      downloadCount: paper.downloadCount
    }));

    return NextResponse.json(formattedPapers);
  } catch (error) {
    console.error('Error fetching wishlist papers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}