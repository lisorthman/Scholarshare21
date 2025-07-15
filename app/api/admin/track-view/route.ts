import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectToDB();
    const db = mongoose.connection;

    // Get the latest realtimedata document with sorting
    const latestData = await db.collection('realtimedata')
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .next(); // Use .next() to get the first document

    // Increment views and insert new record with current timestamp
    const newViews = (latestData?.views || 0) + 1;
    await db.collection('realtimedata').insertOne({
      views: newViews,
      timestamp: new Date(),
    });

    return NextResponse.json({ views: newViews });
  } catch (error) {
    console.error('Failed to track view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}