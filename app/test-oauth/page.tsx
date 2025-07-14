"use client";

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestOAuthPage() {
  const { data: session, status } = useSession();
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [localRole, setLocalRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing tokens in localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setLocalToken(token);
    setLocalRole(role);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/signin' });
    // Also clear local tokens
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>OAuth Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>NextAuth Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        {session?.user && (
          <div>
            <p><strong>User:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> {session.user.role}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Local Storage Tokens</h2>
        <p><strong>Token exists:</strong> {localToken ? 'Yes' : 'No'}</p>
        <p><strong>Role:</strong> {localRole || 'None'}</p>
        {localToken && (
          <details>
            <summary>View Token (first 50 chars)</summary>
            <code style={{ wordBreak: 'break-all' }}>
              {localToken.substring(0, 50)}...
            </code>
          </details>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Environment Check</h2>
        <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</p>
        <p><strong>Google Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</p>
        <p><strong>Facebook Client ID:</strong> {process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ? 'Set' : 'Not set'}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => window.location.href = '/signin'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Sign In
        </button>
        
        <button
          onClick={() => window.location.href = '/signup'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Sign Up
        </button>

        {session && (
          <button
            onClick={handleSignOut}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>Make sure you have set up your environment variables in <code>.env.local</code></li>
          <li>Configure Google and Facebook OAuth apps with the correct redirect URIs</li>
          <li>Click "Go to Sign In" or "Go to Sign Up" to test OAuth</li>
          <li>After successful OAuth, you should see session data and local tokens</li>
        </ol>
      </div>
    </div>
  );
} 