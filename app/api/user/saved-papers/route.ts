import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('savedPapers').populate('savedPapers');

    return NextResponse.json({ savedPapers: user?.savedPapers || [] });
  } catch (error) {
    console.error('Error fetching saved papers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch saved papers' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { paperId, action } = await req.json();

    if (!paperId || !action) {
      return NextResponse.json(
        { error: 'Both paperId and action are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      return NextResponse.json(
        { error: 'Invalid paperId format' },
        { status: 400 }
      );
    }

    const update = action === 'add' 
      ? { $addToSet: { savedPapers: new mongoose.Types.ObjectId(paperId) } }
      : { $pull: { savedPapers: new mongoose.Types.ObjectId(paperId) } };

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      update,
      { new: true }
    ).select('savedPapers');

    return NextResponse.json({ 
      success: true,
      isSaved: action === 'add',
      savedCount: user?.savedPapers.length || 0
    });
  } catch (error) {
    console.error('Error updating saved papers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update saved papers' },
      { status: 500 }
    );
  }
}