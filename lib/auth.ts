// lib/auth.ts - Client-side authentication utilities

// Note: Server-side utilities are in lib/serverAuth.ts

// Token management utilities for client-side
export const tokenUtils = {
  // Check if token exists and is valid
  isTokenValid: (token: string | null): boolean => {
    if (!token) return false;
    
    try {
      // Decode token without verification to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  },

  // Get token expiration time
  getTokenExpiration: (token: string | null): Date | null => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      console.error('Error parsing token expiration:', error);
      return null;
    }
  },

  // Clear all authentication data
  clearAuthData: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      localStorage.removeItem('otpExpiryTime');
      
      // Clear cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  },

  // Validate token with server
  validateTokenWithServer: async (token: string): Promise<{ valid: boolean; user?: any; error?: string }> => {
    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating token with server:', error);
      return { valid: false, error: 'Network error' };
    }
  },

  // Auto-cleanup expired tokens
  cleanupExpiredTokens: (): void => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && !tokenUtils.isTokenValid(token)) {
        console.log('Cleaning up expired token');
        tokenUtils.clearAuthData();
      }
    }
  },

  // Initialize token validation on app startup
  initializeTokenValidation: async (): Promise<{ isValid: boolean; user?: any }> => {
    if (typeof window === 'undefined') {
      return { isValid: false };
    }

    // Clean up expired tokens first
    tokenUtils.cleanupExpiredTokens();

    const token = localStorage.getItem('token');
    if (!token) {
      return { isValid: false };
    }

    // Check if token is valid locally first
    if (!tokenUtils.isTokenValid(token)) {
      tokenUtils.clearAuthData();
      return { isValid: false };
    }

    // Validate with server
    const serverValidation = await tokenUtils.validateTokenWithServer(token);
    if (!serverValidation.valid) {
      tokenUtils.clearAuthData();
      return { isValid: false };
    }

    return { isValid: true, user: serverValidation.user };
  }
};
