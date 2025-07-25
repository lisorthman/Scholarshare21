// middleware.ts (root of your project)
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Define protected routes and required roles
const PROTECTED_ROUTES = {
  admin: ['/admin-dashboard', '/api/admin'],
  researcher: ['/researcher-dashboard', '/api/researcher'],
  user: ['/user-dashboard', '/api/user'],
  common: ['/settings', '/profile'] // Routes accessible to all authenticated users
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // ---- 1. Handle API Routes ---- //
  if (path.startsWith('/api')) {
    try {
      jwt.verify(token!, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication failed' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ---- 2. Handle Page Routes ---- //
  if (['/signin', '/signup', '/verify'].includes(path)) {
    if (token) {
      const redirectPath = role ? `/${role}-dashboard` : '/';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // redirect /donate if unauthenticated
  if (path.startsWith('/donate')) {
    if (!token) {
      const signinUrl = new URL('/signin', request.url);
      signinUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signinUrl);
    }
    // Do NOT check for paperId here
  }

  // Check if route is protected
  const isProtected = Object.values(PROTECTED_ROUTES).some(routes => 
    routes.some(route => path.startsWith(route))
  );

  if (!isProtected) return NextResponse.next();

  // ---- 3. Verify Authentication ---- //
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // ---- 4. Verify Role Access ---- //
  let hasAccess = false;
  if (PROTECTED_ROUTES.admin.some(route => path.startsWith(route))) {
    hasAccess = role === 'admin';
  } else if (PROTECTED_ROUTES.researcher.some(route => path.startsWith(route))) {
    hasAccess = role === 'researcher';
  } else if (PROTECTED_ROUTES.user.some(route => path.startsWith(route))) {
    hasAccess = role === 'user';
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};