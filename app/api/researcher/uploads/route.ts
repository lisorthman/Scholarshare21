import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectToDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

// Constants - MUST MATCH YOUR MONGOOSE MODEL EXACTLY
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// These must EXACTLY match your Mongoose model's enum values
const ALLOWED_CATEGORIES = [
  'Computer Science',
  'Biology',
  'Physics', // Make sure this matches exactly (case-sensitive)
  'Chemistry',
  'Engineering',
  'Mathematics',
  'Medicine',
  'Social Sciences',
  'Other',
  'Uncategorized'
];

export async function POST(request: Request) {
  try {
    await connectToDB();
    const formData = await request.formData();

    // Extract and validate fields
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const authorId = formData.get('authorId') as string;
    const category = formData.get('category') as string;

    // Validate category first
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { 
          error: 'Invalid category selected',
          receivedCategory: category,
          allowedCategories: ALLOWED_CATEGORIES
        },
        { status: 400 }
      );
    }

    // Validate other fields (your existing validation logic)
    // ...

    // Upload to blob storage
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Create paper - now with guaranteed valid category
    const paper = await ResearchPaper.create({
      title,
      abstract,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId: new ObjectId(authorId),
      category, // This is now pre-validated
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      paper: {
        _id: paper._id.toString(),
        title: paper.title,
        category: paper.category,
        status: paper.status,
        fileUrl: paper.fileUrl
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Database operation failed:', error);
    
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
          details: errorDetails,
          allowedCategories: ALLOWED_CATEGORIES // Helpful for debugging
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