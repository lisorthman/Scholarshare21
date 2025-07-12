import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import AdminCategory from '@/models/AdminCategory';
import connectDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';
import { incrementUserCount } from '@/lib/userCounts';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: Request) {
  try {
    await connectDB();
    const formData = await request.formData();

    // Extract and validate fields
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const authorId = formData.get('authorId') as string;
    const categoryId = formData.get('category') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          allowedTypes: ALLOWED_FILE_TYPES.map(t => t.split('/').pop())
        },
        { status: 400 }
      );
    }

    // Validate category exists in database
    const category = await AdminCategory.findById(categoryId);
    if (!category) {
      const allCategories = await AdminCategory.find({}, 'name');
      return NextResponse.json(
        { 
          error: 'Invalid category selected',
          receivedCategoryId: categoryId,
          availableCategories: allCategories
        },
        { status: 400 }
      );
    }

    // Validate other required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!authorId || !ObjectId.isValid(authorId)) {
      return NextResponse.json(
        { error: 'Invalid author ID' },
        { status: 400 }
      );
    }

    // Upload to blob storage
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log('Uploaded file URL for plagiarism check:', blob.url); // Debug log for plagiarism check

    // Create paper
    const paper = await ResearchPaper.create({
      title,
      abstract,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId: new ObjectId(authorId),
      category: category.name,
      categoryId: new ObjectId(categoryId),
      status: 'pending'
    });

    // Increment user's upload count
    await incrementUserCount(authorId, 'uploads');

    return NextResponse.json({
      success: true,
      paper: {
        _id: paper._id.toString(),
        title: paper.title,
        category: paper.category,
        categoryId: paper.categoryId.toString(),
        status: paper.status,
        fileUrl: paper.fileUrl
      },
      // Include this flag for the frontend to trigger a refresh
      shouldRefreshMilestones: true
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Upload failed:', error);
    
    // Special handling for validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as any;
      const errorDetails = Object.values(validationError.errors)
        .map((err: any) => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
      
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errorDetails
        },
        { status: 400 }
      );
    }

    // Generic error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Upload failed', details: errorMessage },
      { status: 500 }
    );
  }
}