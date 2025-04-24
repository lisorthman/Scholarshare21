import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token is required' },
      { status: 400 }
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      name: string;
      email: string;
      role: string;
      _id?: string; // Added for backward compatibility
    };

    // Determine the ID field to use (userId for new tokens, _id for legacy)
    const idField = decoded.userId || decoded._id;
    
    if (!idField) {
      return NextResponse.json(
        { valid: false, error: 'Token missing user identifier' },
        { status: 401 }
      );
    }

    // Validate the ID format
    if (!ObjectId.isValid(idField)) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid user identifier format',
          details: `Received: ${idField} (expected 24-character hex string)`
        },
        { status: 401 }
      );
    }

    // Return the user data with consistent ID field
    return NextResponse.json(
      {
        valid: true,
        user: {
          _id: idField, // Standardized to _id
          userId: idField, // Maintain backward compatibility
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Invalid or expired token',
        ...(error instanceof Error ? { details: error.message } : {})
      },
      { status: 401 }
    );
  }
}