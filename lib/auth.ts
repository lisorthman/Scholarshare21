// lib/auth.ts

import { cookies } from 'next/headers'; // ✅ correct import

export const getSession = async () => {
  const cookieStore = await cookies(); // ✅ use await here
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  // Optional: validate token or fetch user from DB
  return { token }; // Customize based on your logic
};
