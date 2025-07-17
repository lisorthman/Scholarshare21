import { NextResponse } from 'next/server';
import  connectToDB  from '@/lib/mongoose';
import Download from '@/models/Download';

export async function POST(request: Request) {
  try {
    await connectToDB();
    const { paperId, paperTitle, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await Download.create({ paperId, paperTitle, userId });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track download' },
      { status: 500 }
    );
  }
}