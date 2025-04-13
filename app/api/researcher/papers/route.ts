// app/api/researcher/papers/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import ResearchPaper from '@/models/ResearchPaper';
import connectToDB from '@/lib/mongoose';

export async function POST(request: Request) {
  try {
    await connectToDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const authorId = formData.get('authorId') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = (formData.get('keywords') as string)?.split(',');

    // Validate required fields
    if (!file || !title || !category || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`papers/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    // Save metadata to MongoDB
    const newPaper = new ResearchPaper({
      title,
      abstract,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId,
      category,
      keywords,
      status: 'pending'
    });

    await newPaper.save();

    return NextResponse.json(
      { 
        message: 'Paper submitted successfully', 
        paper: newPaper,
        downloadUrl: blob.url 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting paper:', error);
    return NextResponse.json(
      { error: 'Failed to submit paper' },
      { status: 500 }
    );
  }
}