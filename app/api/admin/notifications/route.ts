import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDB();
    const db = mongoose.connection;

    // Fetch pending papers awaiting review
    const pendingPapers = await db.collection('researchpapers')
      .find({ status: 'pending' })
      .toArray();

    // Fetch new researchers with pending status awaiting approval (within last 24 hours)
    const newResearchers = await db.collection('users')
      .find({ role: 'researcher', status: 'pending', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .toArray();

    // Fetch bug reports with pending status (assuming a status field exists)
    const bugs = await db.collection('bugs')
      .find({ status: 'pending' })
      .sort({ timestamp: -1 })
      .limit(5) // Limit to recent bugs
      .toArray();

    // Fetch papers needing plagiarism checks with pending status
    const plagiarismChecks = await db.collection('researchpapers')
      .find({ plagiarismCheck: true, status: 'pending' })
      .toArray();

    // Construct notifications
    const notifications = [
      ...pendingPapers.map(paper => ({
        msg: `New paper "${paper.title}" uploaded and awaiting your review.`,
        time: paper.createdAt ? new Date(paper.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        type: 'paper',
      })),
      ...newResearchers.map(user => ({
        msg: `New researcher "${user.name || user.email}" registered and awaiting approval.`,
        time: user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        type: 'researcher',
      })),
      ...bugs.map(bug => ({
        msg: `Bug reported: ${bug.description || 'No details'}.`,
        time: bug.timestamp ? new Date(bug.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        type: 'bug',
      })),
      ...plagiarismChecks.map(paper => ({
        msg: `Paper "${paper.title}" requires plagiarism checking.`,
        time: paper.createdAt ? new Date(paper.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        type: 'plagiarism',
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}