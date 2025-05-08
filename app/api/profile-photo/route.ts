import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/user";

export async function GET(request: Request) {
  console.log("Received profile photo request:", request.url);
  try {
    await connectDB();
    console.log("Database connected for profile photo request");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.log("User ID is missing in request");
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.profilePhoto) {
      console.log("Profile photo not found for user:", userId);
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    console.log("Raw profilePhoto from DB (first 50 chars):", user.profilePhoto.substring(0, 50) + "...");

    const base64Image = user.profilePhoto.startsWith("/") ? user.profilePhoto.slice(1) : user.profilePhoto;
    console.log("Processed base64Image (first 50 chars):", base64Image.substring(0, 50) + "...");

    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Pattern.test(base64Image)) {
      console.error("Invalid base64 string:", base64Image.substring(0, 50) + "...");
      return NextResponse.json({ message: "Invalid base64 image data" }, { status: 500 });
    }

    let buffer;
    try {
      buffer = Buffer.from(base64Image, "base64");
      console.log("Buffer length:", buffer.length);
    } catch (error) {
      console.error("Base64 decoding error:", error);
      return new NextResponse(Buffer.from(""), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error serving profile photo:", error);
    return new NextResponse(Buffer.from(""), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }
}