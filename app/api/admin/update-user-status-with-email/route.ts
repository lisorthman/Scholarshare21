import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

export async function PUT(request: Request) {
  // Initialize connection
  console.log("Initiating database connection");
  await connectDB();

  try {
    // Step 1: Authentication and Authorization
    console.log("Processing authentication");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as { userId: string; role: string };
    if (decoded.role !== "admin") {
      console.log("Non-admin role detected:", decoded.role);
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Step 2: Parse and Validate Request
    console.log("Parsing request data");
    const { userId, status, reason } = await request.json();
    console.log("Received data:", { userId, status, reason });
    if (!userId || !["Active", "Suspended"].includes(status)) {
      console.log("Invalid input detected:", { userId, status });
      return NextResponse.json({ message: "Invalid userId or status" }, { status: 400 });
    }

    // Step 3: Validate UserId
    console.log("Validating userId format");
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid ObjectId format:", userId);
      return NextResponse.json({ message: "Invalid userId format" }, { status: 400 });
    }

    // Step 4: Check Initial User Existence
    console.log("Checking if user exists");
    const initialUser = await User.findById(userId).lean();
    if (!initialUser) {
      console.log("User not found for ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log("Initial user status:", initialUser.status);

    // Step 5: Check Connection State
    console.log("Checking Mongoose connection state:", mongoose.connection.readyState); // 1 = connected
    if (mongoose.connection.readyState !== 1) {
      console.log("Connection not ready, attempting reconnect");
      await connectDB();
      console.log("Connection state after reconnect:", mongoose.connection.readyState);
    }

    // Step 6: Set Up Email Transporter
    console.log("Configuring email transporter");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Step 7: Process Status Update
    if (status === "Active") {
      console.log("Updating user status to Active");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "Active" },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        throw new Error("Failed to update user status");
      }
      console.log("Updated user status:", updatedUser.status);
      console.log("Updated user document:", updatedUser.toObject());

      // Step 8: Verify Update
      console.log("Verifying update in database");
      const verifiedUser = await User.findById(userId).lean();
      console.log("Verified user ID:", verifiedUser?._id?.toString());
      console.log("Verified user status:", verifiedUser?.status);
      if (!verifiedUser || verifiedUser.status !== "Active") {
        throw new Error(`Verification failed: ${verifiedUser ? `Status is ${verifiedUser.status}` : "User not found"}`);
      }

      // Step 9: Send Email
      console.log("Sending approval email to:", initialUser.email);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: initialUser.email,
        subject: "Account Approved",
        text: `Dear ${initialUser.name},\n\nYour account has been accepted and activated by the team. You can now use your account without any errors.\n\nBest regards,\nThe ScholarShare Team`,
      });

      return NextResponse.json({ message: "User status updated to Active and email sent" }, { status: 200 });
    } else if (status === "Suspended") {
      if (!reason) {
        console.log("No reason provided for suspension");
        return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 });
      }

      console.log("Preparing to suspend user");
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        console.log("User not found for deletion, ID:", userId);
        return NextResponse.json({ message: "User not found for deletion" }, { status: 404 });
      }

      await User.findByIdAndDelete(userId);
      console.log("User deleted for suspension, ID:", userId);

      console.log("Sending rejection email to:", initialUser.email);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: initialUser.email,
        subject: "Account Rejected",
        text: `Dear ${initialUser.name},\n\nYour account has been rejected by the team due to the following reason:\n\n${reason}\n\nBest regards,\nThe ScholarShare Team`,
      });

      return NextResponse.json({ message: "User deleted and email sent" }, { status: 200 });
    }

    console.log("Invalid status reached:", status);
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  } catch (error) {
    console.error("Error in user status update:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: (error as any).code,
    });
    return NextResponse.json({ message: "Failed to update user status", error: error.message }, { status: 500 });
  }
}