import { NextResponse } from "next/server";
import  connectToDB  from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";
import User from "@/models/user";

export async function POST(request: Request) {
  try {
    await connectToDB();

    const { paperId, userId } = await request.json();

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    // Update the paper's download count
    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!updatedPaper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    // If userId is provided, update user's download stats
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { 
          $inc: { 'counts.downloads': 1 },
          $push: { 
            recentlyViewed: {
              paperId: paperId,
              timestamp: new Date()
            }
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      newCount: updatedPaper.downloads
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}