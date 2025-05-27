import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/review";
import ResearchPaper from "@/models/ResearchPaper";
import nodemailer from "nodemailer";

interface ReviewRequestBody {
  paperId: string;
  message: string;
  rating: number;
  reviewerName?: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: ReviewRequestBody = await req.json();
    const { paperId, message, rating, reviewerName = "Anonymous" } = body;

    // Basic validation
    if (!paperId || !message || rating == null) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // Get paper details
    const paper = await ResearchPaper.findById(paperId).populate("authorId");
    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    if (paper.status !== "approved") {
      return NextResponse.json({ error: "Reviews can only be submitted on approved papers." }, { status: 403 });
    }

    // Save review without reviewerId
    const newReview = await Review.create({
      paperId,
      reviewerName,
      message,
      rating,
      createdAt: new Date()
    });

    // Email notification (optional)
    if (paper.authorId?.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: `"ScholarShare" <${process.env.GMAIL_USER}>`,
          to: paper.authorId.email,
          subject: "New Review on Your Research Paper",
          text: `You received a new review from ${reviewerName}:\n\n"${message}"\n\nRating: ${rating}/5`,
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return NextResponse.json({
      message: "Review submitted successfully.",
      review: newReview
    });

  } catch (err) {
    console.error("Error submitting review:", err);
    return NextResponse.json({
      error: "Internal server error."
    }, { status: 500 });
  }
}