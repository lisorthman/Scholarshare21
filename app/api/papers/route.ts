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
    const admin = searchParams.get('admin') === 'true';

    // Base query
    const query: any = admin ? {} : { status: 'passed_checks' }; // Updated from 'approved' to 'passed_checks'

    // Category filtering
    if (category) {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
      ];
    }

    // Get paginated results
    const [papers, total] = await Promise.all([
      ResearchPaper.find(query)
        .populate('authorId', 'name email')
        .select('title abstract fileUrl fileName fileSize fileType authorId category categoryId status plagiarismScore aiScore rejectionReason createdAt') // Explicitly select fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ResearchPaper.countDocuments(query),
    ]);

    return NextResponse.json({
      papers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}