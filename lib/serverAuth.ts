// lib/serverAuth.ts - Server-side authentication utilities

import { cookies } from 'next/headers';

export const getSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  // Optional: validate token or fetch user from DB
  return { token }; // Customize based on your logic
};

// Server-side token validation
export const validateServerToken = async (token: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating token on server:', error);
    return { valid: false, error: 'Server validation failed' };
  }
}; 