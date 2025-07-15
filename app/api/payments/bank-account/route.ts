import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearcherEarnings from '../../../../models/ResearcherEarnings';

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { bankDetails } = await req.json();
    
    const result = await ResearcherEarnings.findOneAndUpdate(
      {}, // Find first document
      {
        $set: { bankAccount: bankDetails }
      },
      { 
        new: true,
        sort: { createdAt: -1 } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}