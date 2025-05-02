import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_CATEGORIES = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Engineering',
  'Mathematics',
  'Medicine',
  'Social Sciences',
  'Other',
  'Uncategorized'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// PATCH: Update research paper
export async function PATCH(
  request: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  await connectToDB();
  const { params } = await contextPromise;

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const abstract = formData.get('abstract') as string;
  const category = formData.get('category') as string;
  const file = formData.get('file') as File | null;

  const paper = await ResearchPaper.findById(params.id);
  if (!paper) {
    return NextResponse.json({ error: 'Research paper not found' }, { status: 404 });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: 'Invalid category', allowed: ALLOWED_CATEGORIES },
      { status: 400 }
    );
  }

  let fileUrl = paper.fileUrl;
  let fileName = paper.fileName;
  let fileSize = paper.fileSize;
  let fileType = paper.fileType;

  if (file && file.size > 0) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const blobRes = await fetch('https://blob.vercel-storage.com/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN!}`,
      },
      body: file
    });

    const blobData = await blobRes.json();

    const oldBlobKey = paper.fileUrl.split('/').pop();
    await fetch(`https://blob.vercel-storage.com/${oldBlobKey}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN!}`,
      },
    });

    fileUrl = blobData.url;
    fileName = file.name;
    fileSize = file.size;
    fileType = file.type;
  }

  paper.title = title;
  paper.abstract = abstract;
  paper.category = category;
  paper.fileUrl = fileUrl;
  paper.fileName = fileName;
  paper.fileSize = fileSize;
  paper.fileType = fileType;

  await paper.save();

  return NextResponse.json({ success: true, paper });
}

// DELETE: Remove paper + file
export async function DELETE(
  request: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  await connectToDB();
  const { params } = await contextPromise;

  const paper = await ResearchPaper.findById(params.id);
  if (!paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  const blobKey = paper.fileUrl.split('/').pop();

  try {
    await fetch(`https://blob.vercel-storage.com/${blobKey}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN!}`,
      },
    });

    await ResearchPaper.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json({ error: 'Failed to delete paper or file' }, { status: 500 });
  }
}
