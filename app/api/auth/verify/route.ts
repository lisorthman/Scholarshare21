import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import connectToDB from "@/lib/mongoose";
import { seedMilestoneConfig } from "@/lib/seedMilestoneConfig";

// Call this once when your app starts
seedMilestoneConfig();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    console.log("Received token from body:", token); // Debugging

    if (!token) {
      console.log("No token provided in body"); // Debugging
      return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET not configured"); // Debugging
      throw new Error("JWT_SECRET not configured");
    }

    await connectToDB();
    console.log("Connected to DB for verification"); // Debugging

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    console.log("Decoded token:", decoded); // Debugging

    // Find user without password
    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean() as { _id: string; name: string; email: string; role: string; status: string; counts?: { uploads: number; approvals: number; downloads: number }; badges?: string[] } | null;
    if (!user) {
      console.log("User not found for ID:", decoded.userId); // Debugging
      return NextResponse.json({ valid: false, error: "User not found" }, { status: 404 });
    }

    console.log("User status from DB:", user.status); // Debugging
    if (user.status !== "Active") {
      console.log("User status is not Active:", user.status); // Debugging
      return NextResponse.json({ valid: false, error: "Account not activated" }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        counts: user.counts || { uploads: 0, approvals: 0, downloads: 0 },
        badges: user.badges || [],
      },
    });
  } catch (error) {
    console.error("Token verification error:", error); // Debugging
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ valid: false, error: "Token expired" }, { status: 401 });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}