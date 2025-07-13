import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearcherEarnings from '../../../../models/ResearcherEarnings';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { paperId } = await req.json();

    // Find latest earnings record and update
    const earnings = await ResearcherEarnings.findOneAndUpdate(
      {},
      {
        $inc: {
          totalEarnings: 1,
          availableBalance: 1
        },
        $push: {
          papersUploaded: {
            paperId,
            amount: 1,
            uploadDate: new Date()
          }
        }
      },
      { 
        new: true,
        sort: { createdAt: -1 } 
      }
    );

    return NextResponse.json({ 
      success: true,
      newBalance: earnings.availableBalance,
      message: 'Earned $1 for paper upload'
    });

  } catch (error) {
    console.error('Revenue update error:', error);
    return NextResponse.json({ error: 'Failed to update revenue' }, { status: 500 });
  }
}