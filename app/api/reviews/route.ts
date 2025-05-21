import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/review";
import ResearchPaper from "@/models/ResearchPaper";
import User from "@/models/user";
import nodemailer from "nodemailer";

// Type safety for expected input
interface ReviewRequestBody {
  paperId: string;
  reviewerId: string;
  message: string;
  rating: number;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: ReviewRequestBody = await req.json();
    const { paperId, reviewerId, message, rating } = body;

    // Basic validation
    if (!paperId || !reviewerId || !message || rating == null) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // Optional: prevent duplicate reviews
    const existingReview = await Review.findOne({ paperId, reviewerId });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this paper." }, { status: 409 });
    }

    // Get paper + author details
    const paper = await ResearchPaper.findById(paperId).populate("authorId");
    if (!paper || !paper.authorId || !paper.authorId.email) {
      return NextResponse.json({ error: "Paper or author not found." }, { status: 404 });
    }

    // Optional: only allow reviews on approved papers
    if (paper.status !== "approved") {
      return NextResponse.json({ error: "Reviews can only be submitted on approved papers." }, { status: 403 });
    }

    // Save review
    const newReview = await Review.create({ paperId, reviewerId, message, rating });

    // Send email to the author
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
        text: `You received a new review:\n\n"${message}"\n\nRating: ${rating}/5`,
      });
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
      // Still return success for review creation, email is optional
      return NextResponse.json({
        message: "Review submitted, but email notification failed.",
        emailError: emailErr instanceof Error ? emailErr.message : emailErr,
      });
    }

    return NextResponse.json({ message: "Review submitted and email sent." });

  } catch (err) {
    console.error("Error submitting review:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
