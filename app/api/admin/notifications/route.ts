import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDB();
    const db = mongoose.connection;

    console.log("Executing query on collection:", db.collection('users').namespace);
    const pendingPapers = await db.collection('researchpapers')
      .find({ status: 'pending' })
      .toArray();

    console.log("Query filter for researchers:", { role: 'researcher', status: { $regex: /^pending$/i } });
    const newResearchers = await db.collection('users')
      .find({ role: 'researcher', status: { $regex: /^pending$/i } }) // Case-insensitive match
      .toArray();
    console.log("New researchers found:", newResearchers);

    const bugs = await db.collection('bugs')
      .find({ status: 'pending' })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    const plagiarismChecks = await db.collection('researchpapers')
      .find({ plagiarismCheck: true, status: 'pending' })
      .toArray();

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

    console.log("All notifications:", notifications);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}