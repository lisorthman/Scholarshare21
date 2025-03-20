// app/api/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken'; // Assuming you're using JWT for tokens

// Utility function to authenticate and authorize users
export async function authenticate(req: NextRequest, allowedRoles: string[]) {
  const token = req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 401 });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      name: string;
      email: string;
      role: string;
    };

    // Check if the user's role is allowed
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    // Return the user object
    return { user };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}