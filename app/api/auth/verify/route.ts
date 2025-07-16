import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import connectDB from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  return handleTokenVerification(request);
}

export async function POST(request: NextRequest) {
  return handleTokenVerification(request);
}

async function handleTokenVerification(request: NextRequest) {
  await connectDB();
  
  try {
    const token = extractToken(request);
    
    if (!token) {
      return unauthorizedResponse("Authorization token required");
    }

    const decoded = verifyJWT(token);
    const user = await getUser(decoded.userId);

    if (!user) {
      return notFoundResponse("User not found");
    }

    return successResponse(user);
  } catch (error) {
    return unauthorizedResponse("Invalid or expired token");
  }
}

// Helper functions
function extractToken(request: NextRequest): string | null {
  return request.headers.get('Authorization')?.split(' ')[1] || 
         request.cookies.get('token')?.value ||
         null;
}

function verifyJWT(token: string): { userId: string; email: string } {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
}

async function getUser(userId: string) {
  return await User.findById(userId).select('-password');
}

function successResponse(user: any) {
  return NextResponse.json({
    valid: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      savedPapers: user.savedPapers // Include saved papers if needed
    }
  });
}

function unauthorizedResponse(message: string) {
  return NextResponse.json(
    { valid: false, error: message },
    { status: 401 }
  );
}

function notFoundResponse(message: string) {
  return NextResponse.json(
    { valid: false, error: message },
    { status: 404 }
  );
}