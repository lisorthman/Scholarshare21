import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { token, newPassword } = await request.json();

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "liso2002") as {
      userId: string;
      role: string;
    };

    const userId = decoded.userId;

    // Generate verification token for password change
    const verificationToken = jwt.sign(
      { userId, newPassword },
      process.env.JWT_SECRET || "liso2002",
      { expiresIn: "1h" }
    );

    // Find user to get email
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-password-change?token=${verificationToken}`;
    
    await resend.emails.send({
      from: "noreply@yourdomain.com",
      to: user.email,
      subject: "Confirm Password Change",
      html: `
        <p>You have requested to change your password. Please click the link below to confirm this change:</p>
        <a href="${verificationLink}">Confirm Password Change</a>
        <p>If you didn't request this change, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error requesting password change:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}