import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDB();

    const db = mongoose.connection;

    // Fetch data from relevant collections
    const realtimedata = await db.collection('realtimedata')
      .find()
      .sort({ timestamp: -1 })
      .limit(2)
      .toArray();

    const users = await db.collection('users').find().toArray();
    const researchpapers = await db.collection('researchpapers').find().toArray();
    const reviews = await db.collection('reviews').find().toArray();
    // Removed researcherearnings collection since we're not using total earnings

    // Get latest and previous data for percentage change calculation
    const latestData = realtimedata[0] || {};
    const prevData = realtimedata[1] || {};

    // Calculate number of registered researchers
    const registeredResearchers = users.filter(user => user.role === 'researcher').length;

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? "+100.00%" : "0.00%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
    };

    const analytics = {
      views: latestData.views || 0,
      // Removed visits
      newUsers: users.length,
      totalDownloads: latestData.totalDownloads || 0,
      paperSubmissions: researchpapers.length,
      reviewCount: reviews.length,
      registeredResearchers: registeredResearchers, // New field for researchers
      changes: {
        viewsChange: calculateChange(latestData.views || 0, prevData.views || 0),
        // Removed visitsChange
        newUsersChange: calculateChange(users.length, prevData.newUsers || 0),
        totalDownloadsChange: calculateChange(latestData.totalDownloads || 0, prevData.totalDownloads || 0),
        paperSubmissionsChange: calculateChange(researchpapers.length, prevData.paperSubmissions || 0),
        reviewCountChange: calculateChange(reviews.length, prevData.reviewCount || 0),
        // Removed totalEarningsChange
        registeredResearchersChange: calculateChange(registeredResearchers, prevData.registeredResearchers || 0), // New change calculation
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('MongoDB connection or query failed:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}