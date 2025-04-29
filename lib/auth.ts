// Lib/auth.ts

import mongoose from 'mongoose';

// Example function to check if user is authenticated (you can adjust this)
export const isAuthenticated = (token: string): boolean => {
  if (!token) return false;
  // Add your token validation logic here
  return true;
};
