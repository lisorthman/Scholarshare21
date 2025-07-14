import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";

export async function GET(request: Request) {
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

    const users = await User.find({}).lean(); // Use lean() for performance
    console.log("Fetched users from DB:", users); // Add logging for debugging
    return NextResponse.json(
      { users: users.map((user) => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        joined: user.createdAt ? user.createdAt.toISOString().split("T")[0] : "N/A", // Fallback if createdAt is undefined
        status: user.status || "N/A", // Fallback if status is undefined
        educationQualification: user.educationQualification || "-", // Add this field
      })) },
      { status: 200 }
    );
  } catch (error) {
    console.error("FetchUsers API: Error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}