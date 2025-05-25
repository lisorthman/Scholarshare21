import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "liso2002") as {
      userId: string;
      newPassword: string;
    };

    const userId = decoded.userId;
    const newPassword = decoded.newPassword;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Hash and update password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying password change:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}