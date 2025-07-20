import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectToDB();
    const db = mongoose.connection;

    // Update or create a single document with a fixed identifier
    const result = await db.collection('realtimedata').findOneAndUpdate(
      { counterId: 'downloadCounter' },
      { $inc: { totalDownloads: 1 }, $set: { timestamp: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    const newTotalDownloads = result?.value?.totalDownloads || 1;
    return NextResponse.json({ totalDownloads: newTotalDownloads });
  } catch (error) {
    console.error('Failed to track download:', error);
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 });
  }
}