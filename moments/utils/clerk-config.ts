// utils/clerk-config.ts
export const clerkConfig = {
  // Redirect URLs after authentication
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  afterSignOutUrl: '/',
  
  // Google OAuth specific settings
  oauth: {
    google: {
      scope: 'openid email profile',
      prompt: 'select_account',
      access_type: 'offline',
    }
  },
  
  // Session settings to prevent immediate logout
  session: {
    // Keep session alive for 30 days
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    // Update session activity
    updateAge: 24 * 60 * 60, // 1 day in seconds
  },
  
  // Additional security settings
  security: {
    // Allow insecure HTTP for development
    allowUnsecuredConnection: process.env.NODE_ENV === 'development',
  }
};

export default clerkConfig;