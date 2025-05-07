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
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { paperId } = await req.json();
  if (!paperId) {
    return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const paper = await ResearchPaper.findById(paperId);
  if (!paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  try {
    const plagiarismScore = await checkPlagiarism(paper.fileUrl);
    const aiScore = await checkAIContent(paper.fileUrl);

    paper.plagiarismScore = plagiarismScore;
    paper.aiScore = aiScore;

    const plagiarismThreshold = 20;
    const aiThreshold = 30;

    if (plagiarismScore > plagiarismThreshold) {
      paper.status = 'rejected_plagiarism';
      paper.rejectionReason = 'Your paper is rejected due to failing in plagiarism test';
    } else if (aiScore > aiThreshold) {
      paper.status = 'rejected_ai';
      paper.rejectionReason = 'Your paper is rejected due to availability of AI content';
    } else {
      paper.status = 'passed_checks';
    }

    await paper.save();

    return NextResponse.json({ message: 'Paper checked successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing paper:', error);
    return NextResponse.json({ error: 'Failed to process paper', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function checkPlagiarism(fileUrl: string): Promise<number> {
  try {
    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error('Invalid file URL');
    }

    const response = await fetch(fileUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let totalMatches = 0;
    let checkedSentences = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length < 10) continue;

      const apiResponse = await fetch('https://www.prepostseo.com/apis/checkSentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: process.env.PREPOSTSEO_API_KEY!,
          query: trimmedSentence,
        }),
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(data.error || 'Plagiarism check failed');

      if (!data.unique) totalMatches += data.totalMatches || 1;
      checkedSentences++;
    }

    const plagiarismPercentage = checkedSentences > 0 ? (totalMatches / checkedSentences) * 100 : 0;
    return Math.min(plagiarismPercentage, 100);
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    return 0;
  }
}

async function checkAIContent(fileUrl: string): Promise<number> {
  try {
    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error('Invalid file URL');
    }

    const response = await fetch(fileUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    const apiResponse = await fetch('https://api.originality.ai/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_DETECTION_API_KEY}`,
      },
      body: JSON.stringify({ content: text }),
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) throw new Error(data.error || 'AI content check failed');

    return data.aiScore || 0;
  } catch (error) {
    console.error('Error checking AI content:', error);
    return 0;
  }
}