import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import ResearchPaper from '@/models/ResearchPaper';
import connectDB from '@/lib/mongoose';

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || (searchParams.get('admin') === 'true' ? 'all' : 'passed_checks');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Base query
    const query: any = {};

    // Status filtering
    if (status !== 'all') {
      query.status = { $in: status.split(',') }; // Split comma-separated statuses and use $in
    } else {
      query.status = { $in: ['pending', 'approved', 'rejected', 'rejected_ai', 'passed_checks'] };
    }

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

    // Add debug log
    console.log('Query being executed:', query);

    // Get paginated results
    const [papers, total] = await Promise.all([
      ResearchPaper.find(query)
        .populate('authorId', 'name email')
        .select('title abstract fileUrl fileName fileSize fileType authorId category categoryId status plagiarismScore aiScore rejectionReason createdAt')
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
    console.error('Error fetching papers:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}