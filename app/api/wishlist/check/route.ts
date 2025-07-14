import { NextResponse } from 'next/server';
import Wishlist from '@/models/Wishlist';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: Request) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('paperId');
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!paperId) {
    return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
  }

  // In a real app, you would verify the token and get the user ID
  // For now, we'll assume the token is the user ID
  const userId = token;

  const wishlistItem = await Wishlist.findOne({ userId, paperId });

  return NextResponse.json({ isInWishlist: !!wishlistItem });
}