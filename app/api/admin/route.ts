import { NextResponse, NextRequest } from 'next/server';
import { authenticate } from '../middleware';

export async function GET(req: NextRequest) {
  // Only allow users with the 'admin' role
  const authResult = await authenticate(req, ['admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // If the admin is authorized, proceed with the logic
  return NextResponse.json({ message: 'Admin route accessed successfully' }, { status: 200 });
}