import { connectDB } from '@/lib/mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await connectDB();
    
    // Example: Fetch data from a collection
    const data = await db.connection.collection('yourCollection').find({}).toArray();
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}