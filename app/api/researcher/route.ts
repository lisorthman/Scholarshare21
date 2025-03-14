import { NextResponse } from 'next/server';
import { authenticate } from '../middleware';

export async function GET(req: Request) {
  // Only allow users with the 'researcher' role
  const authResult = await authenticate(req, ['researcher']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // If the researcher is authorized, proceed with the logic
  return NextResponse.json({ message: 'Researcher route accessed successfully' }, { status: 200 });
}