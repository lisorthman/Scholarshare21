import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils } from '@/lib/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'user';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Initialize authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use the token utility to validate and clean up tokens
        const validation = await tokenUtils.initializeTokenValidation();
        
        if (validation.isValid && validation.user) {
          setAuthState({
            user: validation.user,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Logout function
  const logout = () => {
    tokenUtils.clearAuthData();
    setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    router.push('/signin');
  };

  // Check if user has specific role
  const hasRole = (role: 'admin' | 'researcher' | 'user') => {
    return authState.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: ('admin' | 'researcher' | 'user')[]) => {
    return authState.user ? roles.includes(authState.user.role) : false;
  };

  return {
    ...authState,
    logout,
    hasRole,
    hasAnyRole,
  };
}; 