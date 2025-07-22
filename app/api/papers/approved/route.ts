// app/api/papers/approved/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Paper from "@/models/ResearchPaper";

export async function GET() {
  await connectDB();

  try {
    const papers = await Paper.find({ status: 'approved' })
      .sort({ title: 1 })
      .populate('author', 'name') // Include author name
      .lean(); // Ensure virtuals are included in the plain object
    
    return NextResponse.json(papers);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
  }
}