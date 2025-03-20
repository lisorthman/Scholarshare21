// app/api/researcher/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { authenticate } from '../middleware';

export async function GET(req: NextRequest) {
  try {
    console.log('Request received at /api/researcher'); // Debugging log

    // Only allow users with the 'researcher' role
    const authResult = await authenticate(req, ['researcher']);
    if (authResult instanceof NextResponse) {
      console.log('Authentication failed:', authResult); // Debugging log
      return authResult;
    }

    console.log('Researcher authenticated successfully:', authResult); // Debugging log

    // If the researcher is authorized, return their data
    return NextResponse.json(
      {
        message: 'Researcher route accessed successfully',
        user: {
          name: authResult.user.name,
          email: authResult.user.email,
          role: authResult.user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/researcher:', error); // Debugging log
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}