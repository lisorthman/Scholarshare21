import connectToDB from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import ResearchPaper from '@/models/ResearchPaper';

// GET /api/wishlist → fetch user's saved papers (wishlist)
export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const verifyResponse = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    await connectToDB();
    
    // Get user with saved papers
    const user = await User.findById(verifyData.user._id).populate('savedPapers');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.savedPapers || []);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist → add paper to saved papers
export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const verifyResponse = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { paperId } = await req.json();
    await connectToDB();

    // Check if paper exists
    const paper = await ResearchPaper.findById(paperId);
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // Add paper to user's saved papers if not already saved
    const user = await User.findById(verifyData.user._id);
    if (!user.savedPapers.includes(paperId)) {
      user.savedPapers.push(paperId);
      await user.save();
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
