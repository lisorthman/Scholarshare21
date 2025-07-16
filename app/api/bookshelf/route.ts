import { NextRequest, NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongoose';
import {Bookshelf} from '@/models/Bookshelf';
import ResearchPaper from '@/models/ResearchPaper';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await connectToDB();
  
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

    // Validate paperId format
    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      return NextResponse.json(
        { error: 'Invalid paperId format' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(decoded.userId);
    const paperObjectId = new mongoose.Types.ObjectId(paperId);

    // Verify the paper exists
    const paperExists = await ResearchPaper.exists({ _id: paperObjectId });
    if (!paperExists) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    const validActions = ['addToRead', 'addToReadingList', 'remove'];
    
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    let updateResult;
    
    if (action === 'remove') {
      // Remove the item from bookshelf
      updateResult = await Bookshelf.findOneAndDelete({ 
        userId, 
        paperId: paperObjectId 
      });
    } else {
      const status = action === 'addToRead' ? 'read' : 'toread';
      
      // Upsert operation
      updateResult = await Bookshelf.findOneAndUpdate(
        { userId, paperId: paperObjectId },
        { 
          status,
          $setOnInsert: { 
            addedAt: new Date(),
            createdAt: new Date()
          },
          updatedAt: new Date() 
        },
        { 
          upsert: true,
          new: true 
        }
      );
    }

    // Get updated counts and items in parallel
    const [counts, bookshelfItems] = await Promise.all([
      {
        read: await Bookshelf.countDocuments({ userId, status: 'read' }),
        toRead: await Bookshelf.countDocuments({ userId, status: 'toread' })
      },
      Bookshelf.find({ userId })
        .populate({
          path: 'paperId',
          select: 'title authors abstract fileUrl downloadCount viewCount averageRating',
          transform: (doc) => {
            if (!doc) return null;
            return {
              id: doc._id.toString(),
              title: doc.title,
              authors: doc.authors,
              abstract: doc.abstract,
              fileUrl: doc.fileUrl,
              downloadCount: doc.downloadCount,
              viewCount: doc.viewCount,
              averageRating: doc.averageRating
            };
          }
        })
        .sort({ updatedAt: -1 })
        .lean()
    ]);

    // Transform bookshelf items
    const transformedItems = bookshelfItems.map(item => ({
      ...item,
      id: item._id.toString(),
      userId: item.userId.toString(),
      paperId: item.paperId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      bookshelf: transformedItems,
      counts
    });

  } catch (error) {
    console.error('Bookshelf update error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update bookshelf',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : null : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await connectToDB();
  
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = new mongoose.Types.ObjectId(decoded.userId);

    // Get counts and items in parallel with better population
    const [counts, bookshelfItems] = await Promise.all([
      {
        read: await Bookshelf.countDocuments({ userId, status: 'read' }),
        toRead: await Bookshelf.countDocuments({ userId, status: 'toread' })
      },
      Bookshelf.find({ userId })
        .populate({
          path: 'paperId',
          select: 'title authors abstract fileUrl downloadCount viewCount averageRating',
          transform: (doc) => {
            if (!doc) return null;
            return {
              id: doc._id.toString(),
              title: doc.title,
              authors: doc.authors,
              abstract: doc.abstract,
              fileUrl: doc.fileUrl,
              downloadCount: doc.downloadCount,
              viewCount: doc.viewCount,
              averageRating: doc.averageRating
            };
          }
        })
        .sort({ updatedAt: -1 })
        .lean()
    ]);

    // Transform bookshelf items
    const transformedItems = bookshelfItems.map(item => ({
      ...item,
      id: item._id.toString(),
      userId: item.userId.toString(),
      paperId: item.paperId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      bookshelf: transformedItems,
      counts
    });

  } catch (error) {
    console.error('Bookshelf fetch error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch bookshelf',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : null : undefined
      },
      { status: 500 }
    );
  }
}