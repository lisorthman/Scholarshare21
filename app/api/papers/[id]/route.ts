import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Connecting to the database...');
    await connectDB();
    console.log('Database connected successfully.');

    // Validate the ID format
    console.log('Received ID:', params.id);
    if (!ObjectId.isValid(params.id)) {
      console.error('Invalid paper ID:', params.id);
      return NextResponse.json({ error: 'Invalid paper ID' }, { status: 400 });
    }

    // Fetch the paper by ID
    const paper = await ResearchPaper.findById(new ObjectId(params.id)).lean();
    console.log('Fetched paper:', paper);

    if (!paper) {
      console.error('Paper not found for ID:', params.id);
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching paper:', {
        message: error.message,
        stack: error.stack,
        paramsId: params.id,
      });
    } else {
      console.error('Unknown error fetching paper:', { error, paramsId: params.id });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}