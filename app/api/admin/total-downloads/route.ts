import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Verify token (basic auth check)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all papers across the platform
    const papers = await ResearchPaper.find({});
    console.log("Found papers count:", papers.length);

    if (!papers || papers.length === 0) {
      console.log("No papers found, returning defaults.");
      return NextResponse.json({
        totalDownloads: 0,
        downloadPercentageChange: 0.0,
      });
    }

    // Calculate total downloads
    const totalDownloads = papers.reduce(
      (sum, paper) => sum + (paper.downloads || 0),
      0
    );
    console.log("Calculated totalDownloads:", totalDownloads);

    // Calculate weekly percentage change
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekDownloads = papers.reduce((sum, paper) => {
      const lastDownloadTime = paper.updatedAt;
      if (
        lastDownloadTime &&
        new Date(lastDownloadTime) >= oneWeekAgo
      ) {
        return sum + (paper.downloads || 0);
      }
      return sum;
    }, 0);

    const previousWeekDownloads = papers.reduce((sum, paper) => {
      const lastDownloadTime = paper.updatedAt;
      if (
        lastDownloadTime &&
        new Date(lastDownloadTime) >= twoWeeksAgo &&
        new Date(lastDownloadTime) < oneWeekAgo
      ) {
        return sum + (paper.downloads || 0);
      }
      return sum;
    }, 0);

    const rawChange =
      previousWeekDownloads > 0
        ? (
            ((currentWeekDownloads - previousWeekDownloads) /
              previousWeekDownloads) *
            100
          ).toFixed(1)
        : currentWeekDownloads > 0
        ? "100.0"
        : "0.0";

    const downloadPercentageChange = parseFloat(String(rawChange));

    console.log("Calculated downloadPercentageChange:", downloadPercentageChange);

    return NextResponse.json({
      totalDownloads,
      downloadPercentageChange,
    });
  } catch (error) {
    console.error("[ADMIN TOTAL DOWNLOADS ERROR]", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}