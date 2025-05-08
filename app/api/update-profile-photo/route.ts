// app/api/update-profile-photo/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'edge', // Important for Vercel Blob on Edge
};

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const token = formData.get('token') as string;

    if (!file || !token) {
      return NextResponse.json(
        { message: "File and token are required" },
        { status: 400 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "liso2002") as {
      userId: string;
    };
    const userId = decoded.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `profile-${userId}-${Date.now()}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Update user with the blob URL
    user.profilePhoto = blob.url;
    await user.save();

    return NextResponse.json(
      { 
        url: blob.url,
        message: "Profile photo updated successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}