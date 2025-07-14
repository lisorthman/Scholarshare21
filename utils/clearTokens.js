// Utility script to clear all authentication tokens
// Run this in the browser console to manually clear tokens

const clearAllTokens = () => {
  console.log('🧹 Clearing all authentication tokens...');
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('otpExpiryTime');
  
  // Clear cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  console.log('✅ All tokens cleared successfully!');
  console.log('You can now sign in again.');
  
  // Optionally redirect to signin page
  if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
    window.location.href = '/signin';
  }
};

// Check current token status
const checkTokenStatus = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  console.log('🔍 Current token status:');
  console.log('Token exists:', !!token);
  console.log('Role:', role);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < currentTime;
      
      console.log('Token expiration:', new Date(payload.exp * 1000));
      console.log('Token expired:', isExpired);
      console.log('Token payload:', payload);
    } catch (error) {
      console.log('Error parsing token:', error);
    }
  }
};

// Export functions to global scope for console access
window.clearAllTokens = clearAllTokens;
window.checkTokenStatus = checkTokenStatus;

console.log('🔧 Token utilities loaded!');
console.log('Use clearAllTokens() to clear all tokens');
console.log('Use checkTokenStatus() to check current token status'); 