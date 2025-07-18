import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    await connectDB();

    let query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (status !== "all") {
      query.status = status;
    }

    const papers = await ResearchPaper.find(query)
      .populate("authorId", "name email")
      .select("title fileUrl status plagiarismScore rejectionReason createdAt")
      .lean();

    return NextResponse.json({ papers }, { status: 200 });
  } catch (error: any) {
    console.error("Check papers error:", error);
    return NextResponse.json({ error: "Failed to fetch papers", details: error.message }, { status: 500 });
  }
}