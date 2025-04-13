import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectDB from '@/lib/mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Base query - only show approved papers
    const query: any = { status: 'approved' };

    // Category filtering
    if (category) {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    // Get paginated results
    const [papers, total] = await Promise.all([
      ResearchPaper.find(query)
        .populate('author', 'name email') // Include author details
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
        
      ResearchPaper.countDocuments(query)
    ]);

    return NextResponse.json({
      papers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}