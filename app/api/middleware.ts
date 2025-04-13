// app/api/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
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

    // If specific roles are required, check them
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Return both user and a success response
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
  // Protect researcher routes
  if (req.nextUrl.pathname.startsWith('/researcher')) {
    const authResult = await authenticate(req, ['researcher', 'admin']);
    
    if (authResult instanceof NextResponse) {
      // If it's a response, there was an error
      return authResult;
    }
    
    // Add user to request headers for API routes
    const headers = new Headers(req.headers);
    headers.set('x-user-id', authResult.user.id);
    headers.set('x-user-role', authResult.user.role);
    
    return NextResponse.next({ request: { headers } });
  }

  // For other routes, just continue
  return NextResponse.next();
}