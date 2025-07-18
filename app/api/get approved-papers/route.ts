import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';

export async function GET() {
  await mongooseConnect();
  const papers = await ResearchPaper.find({ status: 'approved' }).sort({ title: 1 });
  return NextResponse.json({ papers });
}
