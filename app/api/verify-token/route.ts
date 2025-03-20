// app/api/verify-token/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      name: string;
      email: string;
      role: string;
    };

    // Return the user data
    return NextResponse.json(
      {
        valid: true,
        user: {
          name: user.name, // Include the name
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}