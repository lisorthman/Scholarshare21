'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  hasRole: (role: 'admin' | 'researcher' | 'user') => boolean;
  hasAnyRole: (roles: ('admin' | 'researcher' | 'user')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize authentication on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthProvider: Initializing authentication...');
        
        // Check if we're in the middle of a logout (tokens were just cleared)
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('ℹ️ AuthProvider: No token found, user not authenticated');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Use the token utility to validate and clean up tokens
        const validation = await tokenUtils.initializeTokenValidation();
        
        if (validation.isValid && validation.user) {
          console.log('✅ AuthProvider: Token is valid, user authenticated:', validation.user.name);
          setUser(validation.user);
          setIsAuthenticated(true);
        } else {
          console.log('❌ AuthProvider: Token is invalid or expired, user not authenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('💥 AuthProvider: Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log('🏁 AuthProvider: Authentication initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add a listener for storage changes to detect new tokens
  useEffect(() => {
    const handleStorageChange = async () => {
      console.log('🔄 AuthProvider: Storage changed, re-validating token...');
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        console.log('🆕 AuthProvider: New token detected, validating...');
        const validation = await tokenUtils.initializeTokenValidation();
        if (validation.isValid && validation.user) {
          console.log('✅ AuthProvider: New token is valid, updating state...');
          setUser(validation.user);
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  // Logout function
  const logout = () => {
    console.log('🚪 AuthProvider: Logging out user...');
    tokenUtils.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    
    // Add a small delay to ensure state updates complete
    setTimeout(() => {
      console.log('🔄 AuthProvider: Redirecting to signin...');
      // Use window.location.href to force a full page reload
      // This ensures all components re-initialize with the cleared auth state
      window.location.href = '/signin';
    }, 100);
  };

  // Check if user has specific role
  const hasRole = (role: 'admin' | 'researcher' | 'user') => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: ('admin' | 'researcher' | 'user')[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    logout,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};