// app/api/papers/approved/route.ts
import { NextResponse } from 'next/server';
import Paper from '@/models/paper';
import {connectDB} from '@/lib/connectDB';

export async function GET() {
  try {
    await connectDB();
    const papers = await Paper.find({ status: 'approved' }).select('title _id'); // query model
    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Fetch approved papers error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}