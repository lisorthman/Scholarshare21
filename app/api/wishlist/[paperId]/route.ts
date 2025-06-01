import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import  connectToDB  from '@/lib/mongoose';
import User from '@/models/user';

// DELETE /api/wishlist/[paperId] - Remove from wishlist
export async function DELETE(
  request: Request,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the paper from wishlist
    user.wishlist = user.wishlist.filter(
      (id: string) => id.toString() !== params.paperId
    );
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}