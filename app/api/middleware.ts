import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function authenticate(req: NextRequest, allowedRoles: string[]) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string };

    // Check if the user's role is allowed
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ message: 'Access denied. Insufficient permissions.' }, { status: 403 });
    }

    // If everything is fine, return the decoded token
    return decoded;
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}