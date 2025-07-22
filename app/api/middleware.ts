// app/api/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

// Enhanced authentication middleware
export async function authenticate(req: NextRequest, allowedRoles?: string[]) {
  const token = req.headers.get('Authorization')?.split(' ')[1] ||
                req.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return { 
      user,
      success: NextResponse.next()
    };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

// Route protection middleware
export async function protectRoutes(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/researcher')) {
    const authResult = await authenticate(req, ['researcher', 'admin']);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const headers = new Headers(req.headers);
    headers.set('x-user-id', authResult.user.id);
    headers.set('x-user-role', authResult.user.role);
    
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

// --- Next.js Middleware for route protection ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // Only protect /donate route if unauthenticated
  if (pathname.startsWith('/donate') && !token) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signinUrl);
  }

  // Keep your existing researcher/admin checks
  if (pathname.startsWith('/researcher')) {
    return await protectRoutes(request);
  }

  // Default: continue
  return NextResponse.next();
}