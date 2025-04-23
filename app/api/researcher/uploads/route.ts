import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import ResearchPaper from '@/models/ResearchPaper';
import connectToDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

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

    // Validate ObjectId first
    if (!ObjectId.isValid(authorId)) {
      return NextResponse.json(
        { 
          error: 'Invalid author ID format',
          received: authorId,
          expected: '24-character hex string'
        },
        { status: 400 }
      );
    }

    // Basic validation
    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing required fields (file, title)' },
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
      fileUrl: blob.url,
      fileName: file.name, // Use original filename
      fileSize: file.size,
      fileType: file.type,
      authorId: new ObjectId(authorId), // Use native MongoDB ObjectId
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      paper: {
        _id: paper._id.toString(),
        title: paper.title,
        fileUrl: paper.fileUrl,
        authorId: paper.authorId.toString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}