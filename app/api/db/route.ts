// app/api/data/route.ts
import connectDB from '@/lib/mongoose';

export async function GET() {
  try {
    const db = await connectDB();
    // Example: Fetch some data
    const data = await db.connection.collection('yourCollection').find({}).toArray();
    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}