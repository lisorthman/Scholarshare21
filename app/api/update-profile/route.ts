import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function PATCH(request: Request) {
  try {
    await connectDB();
    console.log("Database connected");

    const { name, email, password, token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "liso2002") as {
      userId: string;
      name: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
    
    // Check if user has allowed role
    if (!['admin', 'researcher'].includes(decoded.role)) {
      return NextResponse.json({ message: "Unauthorized role" }, { status: 403 });
    }

    const userId = decoded.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
    }

    await user.save();

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}