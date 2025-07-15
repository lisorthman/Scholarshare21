import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDB();
    const db = mongoose.connection;

    // Fetch user registration data by month for the last 6 months
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await db.collection('users').aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo }, role: 'researcher' } // Filter for researchers
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 } // Sort by date
      }
    ]).toArray();

    // Format data for the graph
    const growthData = userGrowth.map(item => ({
      month: item._id,
      users: item.count
    }));

    return NextResponse.json(growthData);
  } catch (error) {
    console.error('Failed to fetch user growth data:', error);
    return NextResponse.json({ error: 'Failed to fetch user growth data' }, { status: 500 });
  }
}