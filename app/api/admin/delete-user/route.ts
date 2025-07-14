import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";

export async function DELETE(request: Request) {
  await connectDB();

  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as { userId: string; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DeleteUser API: Error:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}