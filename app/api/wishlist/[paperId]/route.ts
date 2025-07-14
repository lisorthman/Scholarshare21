import { NextResponse } from 'next/server';
import Wishlist from '@/models/Wishlist';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: Request, { params }: { params: { paperId: string } }) {
  await dbConnect();
  
  const { paperId } = params;
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real app, you would verify the token and get the user ID
  const userId = token;

  try {
    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, paperId });

    if (existingItem) {
      return NextResponse.json({ message: 'Already in wishlist' });
    }

    // Add to wishlist
    await Wishlist.create({ userId, paperId });

    return NextResponse.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { paperId: string } }) {
  await dbConnect();
  
  const { paperId } = params;
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real app, you would verify the token and get the user ID
  const userId = token;

  try {
    // Remove from wishlist
    await Wishlist.deleteOne({ userId, paperId });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}