import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      name: string; // Ensure name is included
      email: string;
      role: string;
    };

    console.log('Decoded token:', decoded); // Debugging log

    return NextResponse.json({ valid: true, user: decoded }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 401 });
  }
}