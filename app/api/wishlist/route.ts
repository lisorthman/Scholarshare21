import connectToDB from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Wishlist } from '@/models/wishlist';

// GET /api/wishlist → fetch user's wishlist
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();
    const wishlist = await Wishlist.find({ userId: session.user.id }).lean();

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist → add paper to wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paperId } = await req.json();
    await connectToDB();

    const existing = await Wishlist.findOne({
      userId: session.user.id,
      paperId,
    });

    if (!existing) {
      await Wishlist.create({
        userId: session.user.id,
        paperId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
