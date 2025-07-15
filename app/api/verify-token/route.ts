import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";

export async function POST(request: Request) {
  await connectDB();

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Token is required" },
      { status: 400 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      name: string;
      email: string;
      role: string;
      _id?: string;
    };

    const idField = decoded.userId || decoded._id;

    if (!idField) {
      return NextResponse.json(
        { valid: false, error: "Token missing user identifier" },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(idField)) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid user identifier format",
          details: `Received: ${idField} (expected 24-character hex string)`,
        },
        { status: 401 }
      );
    }

    const user = await User.findById(idField).select("-password");
    if (!user) {
      console.log("User not found for ID:", idField);
      return NextResponse.json(
        { valid: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Only require status 'Active' for researchers
    if (user.role === "researcher" && user.status !== "Active") {
      return NextResponse.json(
        { valid: false, error: "Account not activated" },
        { status: 403 }
      );
    }

    // Allow all roles: admin, researcher, user
    // You can add more granular checks in frontend/dashboard

    return NextResponse.json(
      {
        valid: true,
        user: {
          _id: user._id.toString(),
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          researchField: user.researchField,
          savedPapers: user.savedPapers,
          recentlyViewed: user.recentlyViewed,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
          joined: user.createdAt ? user.createdAt.toISOString().split("T")[0] : null,

          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Invalid or expired token",
        ...(error instanceof Error ? { details: error.message } : {}),
      },
      { status: 401 }
    );
  }
}