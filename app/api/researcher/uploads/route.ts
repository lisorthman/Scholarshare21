import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectToDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

// Define a custom error type interface
interface MongooseValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

export const config = {
  runtime: 'edge',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: Request) {
  try {
    await connectToDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const authorId = formData.get('authorId') as string;
    const abstract = formData.get('abstract') as string;
    const category = formData.get('category') as string;
    const keywords = formData.getAll('keywords') as string[];

    // Validate ObjectId
    if (!ObjectId.isValid(authorId)) {
      return NextResponse.json(
        { error: 'Invalid author ID format' },
        { status: 400 }
      );
    }

    // Required fields validation
    if (!file || !title || !abstract || !category) {
      return NextResponse.json(
        { error: 'Missing required fields (file, title, abstract, or category)' },
        { status: 400 }
      );
    }

    // File validation
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF/DOCX files allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Save to MongoDB
    const paper = await ResearchPaper.create({
      title,
      abstract,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId: new ObjectId(authorId),
      category,
      keywords: keywords.filter(k => k.trim().length > 0),
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      paper: {
        _id: paper._id.toString(),
        title: paper.title,
        fileUrl: paper.fileUrl,
        authorId: paper.authorId.toString(),
        status: paper.status
      }
    });

  } catch (error: unknown) { // TypeScript now knows error is of type unknown
    console.error('API Error:', error);
    
    // Initialize error response
    const errorResponse: {
      error: string;
      message?: string;
      validationErrors?: Array<{ field: string; message: string }>;
    } = {
      error: 'Upload failed'
    };

    // Check if it's a standard Error
    if (error instanceof Error) {
      errorResponse.message = error.message;
      
      // Check if it's a Mongoose validation error
      if ('errors' in error) {
        const mongooseError = error as MongooseValidationError;
        errorResponse.validationErrors = Object.entries(mongooseError.errors || {}).map(
          ([field, err]) => ({
            field,
            message: err.message
          })
        );
      }
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}