import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function PUT(request: Request) {
  await connectDB();

  try {
    // 1. Authentication Check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Authorization Check (Admin Only)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    ) as { userId: string; role: string };
    
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 3. Request Validation
    const { userId, status } = await request.json();
    
    if (!userId || !status) {
      return NextResponse.json(
        { message: "User ID and status are required" },
        { status: 400 }
      );
    }

    // 4. Status Validation
    const validStatuses = ["Active", "Suspended", "Pending"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // 5. Update User Status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 6. Success Response
    return NextResponse.json(
      { 
        message: `User status updated to ${status}`,
        user: updatedUser 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("UpdateUserStatus API Error:", error);
    
    // Handle JWT verification errors specifically
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}