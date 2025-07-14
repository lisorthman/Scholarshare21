"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { tokenUtils } from '@/lib/auth';

export default function OAuthCallback() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
          setError('Authentication failed');
          setIsProcessing(false);
          return;
        }

        if (session?.user) {
          // Call our OAuth callback API to get JWT token
          const response = await fetch('/api/auth/oauth-callback');
          const data = await response.json();

          if (data.success) {
            // Clear any existing tokens
            tokenUtils.clearAuthData();

            // Set the new token and role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('email', data.user.email);

            // Set cookies for SSR compatibility
            document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 hours
            document.cookie = `role=${data.user.role}; path=/; max-age=86400`;

            console.log('✅ OAuth authentication successful');
            
            // Redirect to appropriate dashboard based on role
            const dashboardPath = `/${data.user.role}-dashboard`;
            router.push(dashboardPath);
          } else {
            setError(data.error || 'Authentication failed');
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('An error occurred during authentication');
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [session, status, router]);

  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Processing authentication...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => router.push('/signin')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return null;
} 