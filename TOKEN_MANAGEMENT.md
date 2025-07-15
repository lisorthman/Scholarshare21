# Token Management System

This document explains the new automatic token management system implemented to solve the issue of persistent JWT tokens in localStorage.

## Problem Solved

Previously, JWT tokens would persist in localStorage even after:
- Closing the browser/terminal
- Restarting the development server
- Token expiration

This required manual token deletion to sign in again.

## Solution Overview

The new system provides:

1. **Automatic token validation** on app startup
2. **Automatic cleanup** of expired/invalid tokens
3. **Centralized token management** utilities
4. **Global authentication state** management
5. **Manual token clearing** utilities for testing

## Key Components

### 1. Token Utilities (`lib/auth.ts`)

```typescript
import { tokenUtils } from '@/lib/auth';

// Check if token is valid locally
const isValid = tokenUtils.isTokenValid(token);

// Clear all authentication data
tokenUtils.clearAuthData();

// Validate token with server
const validation = await tokenUtils.validateTokenWithServer(token);

// Auto-cleanup expired tokens
tokenUtils.cleanupExpiredTokens();

// Initialize token validation on app startup
const result = await tokenUtils.initializeTokenValidation();
```

### 2. AuthProvider (`components/AuthProvider.tsx`)

Provides global authentication state and automatic token validation:

```typescript
import { useAuthContext } from '@/components/AuthProvider';

const { user, loading, isAuthenticated, logout, hasRole } = useAuthContext();
```

### 3. Updated Layout (`app/layout.tsx`)

Wraps the entire app with AuthProvider for global authentication state.

## How It Works

### On App Startup

1. **AuthProvider** initializes and calls `tokenUtils.initializeTokenValidation()`
2. **Local validation** checks if token exists and is not expired
3. **Server validation** verifies token with the backend
4. **Automatic cleanup** removes invalid/expired tokens
5. **State update** sets authentication state based on validation results

### On Login/Signup

1. **Clear existing tokens** before setting new ones
2. **Set new token** in localStorage and cookies
3. **Update authentication state** through AuthProvider

### On Logout

1. **Clear all tokens** from localStorage and cookies
2. **Reset authentication state**
3. **Redirect to signin page**

## Usage Examples

### In Dashboard Components

```typescript
import { useAuthContext } from '@/components/AuthProvider';

export default function Dashboard() {
  const { user, loading, isAuthenticated, hasRole } = useAuthContext();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  if (!hasRole('researcher')) return <div>Unauthorized</div>;
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Manual Token Management

```typescript
import { tokenUtils } from '@/lib/auth';

// Clear tokens manually
tokenUtils.clearAuthData();

// Check token status
const isValid = tokenUtils.isTokenValid(localStorage.getItem('token'));
```

## Browser Console Utilities

For testing and debugging, the following functions are available in the browser console:

```javascript
// Clear all tokens and redirect to signin
clearAllTokens();

// Check current token status
checkTokenStatus();
```

## Benefits

1. **No more persistent tokens** - Tokens are automatically validated and cleaned up
2. **Better security** - Expired tokens are immediately removed
3. **Improved UX** - Users don't need to manually clear tokens
4. **Centralized management** - All token operations go through consistent utilities
5. **Easy debugging** - Console utilities for testing

## Migration Guide

### For Existing Components

1. **Replace manual token checks** with `useAuthContext()`
2. **Remove manual localStorage operations** - use `tokenUtils` instead
3. **Update logout functions** to use `tokenUtils.clearAuthData()`

### Example Migration

**Before:**
```typescript
const token = localStorage.getItem('token');
if (!token) router.push('/login');
// Manual token validation...
```

**After:**
```typescript
const { isAuthenticated, loading } = useAuthContext();
if (!loading && !isAuthenticated) router.push('/signin');
```

## Testing

1. **Start the app** - tokens should be automatically validated
2. **Close browser/terminal** - restart development server
3. **Reopen app** - expired tokens should be automatically cleared
4. **Use console utilities** - `clearAllTokens()` and `checkTokenStatus()`

## Troubleshooting

### Token Still Persists

1. Check browser console for errors
2. Use `checkTokenStatus()` to verify token state
3. Use `clearAllTokens()` to manually clear tokens
4. Check if AuthProvider is properly wrapping the app

### Authentication Issues

1. Verify JWT_SECRET environment variable is set
2. Check network requests in browser dev tools
3. Ensure verify-token API endpoint is working
4. Check server logs for token validation errors 