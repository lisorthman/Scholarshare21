import { NextResponse } from 'next/server';
import { authenticate } from '../middleware';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Allow users with 'user', 'researcher', or 'admin' roles
  const authResult = await authenticate(req, ['user', 'researcher', 'admin']);
  
  // If authentication fails, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // If the user is authorized, return their data
  const user = authResult.user; // Assuming `authenticate` returns the user object
  return NextResponse.json(
    {
      message: 'User data fetched successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );
}