// app/api/researcher/activities/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import Review from '@/models/review';
import User from '@/models/user';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get('researcherId');
    
    if (!researcherId) {
      return NextResponse.json({ error: 'Researcher ID is required' }, { status: 400 });
    }

    await connectDB();

    const activities: any[] = [];

    // Get recent paper uploads and status changes
    const papers = await ResearchPaper.find({ authorId: researcherId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    papers.forEach((paper: any) => {
      // Paper upload activity
      activities.push({
        id: `paper_upload_${paper._id}`,
        type: 'upload',
        title: paper.title,
        paperId: paper._id.toString(),
        date: paper.createdAt,
        time: new Date(paper.createdAt).toLocaleTimeString(),
        status: paper.status,
        message: `New paper "${paper.title}" uploaded`
      });

      // Paper edit activity (if updated after creation)
      if (paper.updatedAt > paper.createdAt) {
        activities.push({
          id: `paper_edit_${paper._id}`,
          type: 'edit',
          title: paper.title,
          paperId: paper._id.toString(),
          date: paper.updatedAt,
          time: new Date(paper.updatedAt).toLocaleTimeString(),
          message: `Paper "${paper.title}" was updated`
        });
      }

      // Admin response activity (if status changed)
      if (paper.status !== 'pending') {
        activities.push({
          id: `admin_response_${paper._id}`,
          type: 'admin_response',
          title: paper.title,
          paperId: paper._id.toString(),
          date: paper.updatedAt,
          time: new Date(paper.updatedAt).toLocaleTimeString(),
          status: paper.status,
          message: `Paper "${paper.title}" ${paper.status.replace('_', ' ')} by admin`
        });
      }
    });

    // Get recent user reviews/replies
    const reviews = await Review.find({ 
      paperId: { $in: papers.map((p: any) => p._id) } 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    reviews.forEach((review: any) => {
      const paper = papers.find((p: any) => p._id.toString() === review.paperId.toString());
      if (paper) {
        activities.push({
          id: `review_${review._id}`,
          type: 'user_reply',
          title: paper.title,
          paperId: review.paperId.toString(),
          reviewId: review._id.toString(),
          reviewerName: review.reviewerName,
          rating: review.rating,
          message: review.message,
          date: review.createdAt,
          time: new Date(review.createdAt).toLocaleTimeString(),
          replyMessage: `New ${review.rating}-star review from ${review.reviewerName}`
        });
      }
    });

    // Get user profile changes (last login, profile updates)
    const user = await User.findById(researcherId).lean() as any;
    if (user) {
      // Profile picture upload (if exists)
      if (user.profilePhoto) {
        activities.push({
          id: `profile_photo_${user._id}`,
          type: 'profile_photo',
          date: user.updatedAt,
          time: new Date(user.updatedAt).toLocaleTimeString(),
          message: 'Profile picture updated'
        });
      }

      // Profile edits
      if (user.updatedAt > user.createdAt) {
        activities.push({
          id: `profile_edit_${user._id}`,
          type: 'profile_edit',
          date: user.updatedAt,
          time: new Date(user.updatedAt).toLocaleTimeString(),
          message: 'Profile information updated'
        });
      }
    }

    // Sort all activities by date (newest first) and limit to 20
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    return NextResponse.json({ activities: sortedActivities });
  } catch (error) {
    console.error('[RESEARCHER ACTIVITIES ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 