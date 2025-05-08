import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import connectDB from "@/lib/mongoose"; // Ensure this is imported
import User from "@/models/user"; // Ensure this is imported

export async function POST(request: Request) {
  await connectDB(); // Connect to the database

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Token is required" },
      { status: 400 }
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      name: string;
      email: string;
      role: string;
      _id?: string; // Added for backward compatibility
    };

    // Determine the ID field to use (userId for new tokens, _id for legacy)
    const idField = decoded.userId || decoded._id;

    if (!idField) {
      return NextResponse.json(
        { valid: false, error: "Token missing user identifier" },
        { status: 401 }
      );
    }

    // Validate the ID format
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

    // Query the database for the latest user data
    const user = await User.findById(idField).select("-password"); // Exclude password for security
    if (!user) {
      console.log("User not found for ID:", idField);
      return NextResponse.json(
        { valid: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return the user data with updated fields
    return NextResponse.json(
      {
        valid: true,
        user: {
          _id: user._id.toString(),
          userId: user._id.toString(), // Maintain backward compatibility
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto, // Include profilePhoto
          researchField: user.researchField,
          savedPapers: user.savedPapers,
          recentlyViewed: user.recentlyViewed,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin, // Added lastLogin field
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