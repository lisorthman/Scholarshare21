'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { tokenUtils } from '@/lib/auth';

export default function TestAuthPage() {
  const { user, loading, isAuthenticated, logout } = useAuthContext();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    // Get token info for display
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenInfo({
          exists: true,
          expired: payload.exp && payload.exp < Math.floor(Date.now() / 1000),
          expiration: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiration',
          payload
        });
      } catch (error) {
        setTokenInfo({ exists: true, error: 'Invalid token format' });
      }
    } else {
      setTokenInfo({ exists: false });
    }
  }, []);

  const handleClearTokens = () => {
    tokenUtils.clearAuthData();
    window.location.reload();
  };

  const handleCheckToken = () => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    if ((window as any).checkTokenStatus) {
      (window as any).checkTokenStatus();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
        {user && (
          <div>
            <p><strong>User:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Token Information</h2>
        {tokenInfo ? (
          <div>
            <p><strong>Token Exists:</strong> {tokenInfo.exists ? '✅ Yes' : '❌ No'}</p>
            {tokenInfo.exists && (
              <>
                <p><strong>Token Expired:</strong> {tokenInfo.expired ? '❌ Yes' : '✅ No'}</p>
                <p><strong>Expiration:</strong> {tokenInfo.expiration}</p>
                {tokenInfo.error && <p><strong>Error:</strong> {tokenInfo.error}</p>}
              </>
            )}
          </div>
        ) : (
          <p>Loading token info...</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleClearTokens}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear All Tokens
          </button>
          
          <button 
            onClick={handleCheckToken}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Check Token (Console)
          </button>
          
          {isAuthenticated && (
            <button 
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Console Utilities</h2>
        <p>Open browser console and use these functions:</p>
        <ul>
          <li><code>clearAllTokens()</code> - Clear all tokens and redirect to signin</li>
          <li><code>checkTokenStatus()</code> - Check current token status</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Testing Instructions</h2>
        <ol>
          <li>Sign in to your account</li>
          <li>Check that authentication status shows as authenticated</li>
          <li>Close the browser/terminal</li>
          <li>Restart the development server</li>
          <li>Reopen the app - tokens should be automatically validated</li>
          <li>If tokens are expired, they should be automatically cleared</li>
        </ol>
      </div>
    </div>
  );
} 