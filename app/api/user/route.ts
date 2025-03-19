import { NextResponse } from 'next/server';
import { authenticate } from '../middleware';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow users with the 'user' role
  const authResult = await authenticate(req, ['user']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // If the user is authorized, proceed with the logic
  return NextResponse.json({ message: 'User route accessed successfully' }, { status: 200 });
}