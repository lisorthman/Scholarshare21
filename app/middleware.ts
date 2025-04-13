// middleware.ts (in root of your project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectRoutes } from '@/app/api/middleware';

export async function middleware(request: NextRequest) {
  // Apply route protection
  return await protectRoutes(request);
}

export const config = {
  matcher: [
    '/researcher/:path*',
    '/api/researcher/:path*'
  ],
};