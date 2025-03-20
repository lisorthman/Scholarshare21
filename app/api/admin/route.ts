// app/api/admin/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { authenticate } from '../middleware';

export async function GET(req: NextRequest) {
  try {
    console.log('Request received at /api/admin'); // Debugging log

    // Only allow users with the 'admin' role
    const authResult = await authenticate(req, ['admin']);
    if (authResult instanceof NextResponse) {
      console.log('Authentication failed:', authResult); // Debugging log
      return authResult;
    }

    console.log('Admin authenticated successfully:', authResult); // Debugging log

    // If the admin is authorized, return their data
    return NextResponse.json(
      {
        message: 'Admin route accessed successfully',
        user: {
          name: authResult.user.name,
          email: authResult.user.email,
          role: authResult.user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/admin:', error); // Debugging log
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}