import { NextRequest, NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import User from '@/models/user';
import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const admin = searchParams.get('admin') === 'true';
    const search = searchParams.get('search');

    // Base query
    const query: any = admin ? {} : { status: 'passed_checks' };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude admin papers
    const adminUsers = await User.find({ role: 'admin' }, '_id').lean();
    const adminUserIds = adminUsers.map(user => new mongoose.Types.ObjectId(user._id));
    query.authorId = { $nin: adminUserIds };

    // Get paginated results
    const [papers, total] = await Promise.all([
      ResearchPaper.find(query)
        .populate('authorId', 'name email')
        .select('title abstract fileUrl fileName fileSize fileType authorId category categoryId status plagiarismScore rejectionReason createdAt')
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
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}