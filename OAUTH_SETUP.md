# OAuth Setup Guide for ScholarShare

This guide will help you set up Google and Facebook OAuth authentication for your ScholarShare application.

## Prerequisites

- A Google Developer Account
- A Facebook Developer Account
- Your application running on localhost:3000 (for development)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id-here
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret-here

# MongoDB (if not already configured)
MONGODB_URI=your-mongodb-connection-string-here

# JWT Secret (for token generation)
JWT_SECRET=your-jwt-secret-key-here
```

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret to your `.env.local` file

## Facebook OAuth Setup

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Consumer" as the app type
4. Fill in the required information

### 2. Configure Facebook Login

1. In your app dashboard, go to "Products" > "Facebook Login"
2. Click "Set Up"
3. Choose "Web" platform
4. Add your site URL: `http://localhost:3000` (for development)
5. Add OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (for development)
   - `https://yourdomain.com/api/auth/callback/facebook` (for production)

### 3. Get App Credentials

1. Go to "Settings" > "Basic"
2. Copy the App ID and App Secret to your `.env.local` file

## Generate NextAuth Secret

Generate a secure random string for NEXTAUTH_SECRET:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use an online generator
# https://generate-secret.vercel.app/32
```

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signin` or `http://localhost:3000/signup`

3. Click on the Google or Facebook sign-in buttons

4. You should be redirected to the respective OAuth provider's login page

5. After successful authentication, you'll be redirected back to your application

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URIs in your OAuth provider settings match exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**
   - Verify your environment variables are correctly set
   - Restart your development server after changing environment variables

3. **"App not configured" error (Facebook)**
   - Make sure your Facebook app is in "Live" mode
   - Add your domain to the app's allowed domains

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

## Production Deployment

When deploying to production:

1. Update the redirect URIs in your OAuth provider settings
2. Set `NEXTAUTH_URL` to your production domain
3. Use a strong, unique `NEXTAUTH_SECRET`
4. Ensure your environment variables are properly set in your hosting platform

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage and set up alerts for unusual activity 