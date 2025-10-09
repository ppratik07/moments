import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Define session claims interface
interface SessionClaims {
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/orders(.*)',
  '/new-project(.*)',
  '/contribution(.*)',
  '/download(.*)', 
  '/previewbook(.*)',
  '/project(.*)',
  '/thank-you(.*)'
])

// Public routes that should be accessible without auth
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl

  // Allow public routes without protection
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    try {
      await auth.protect()
    } catch (error) {
      console.error('Auth protection error:', error)
      // Redirect to sign-in if protection fails
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Get authentication state after protection check
  const authObject = await auth()
  const { userId, sessionClaims } = authObject

  // Sync authenticated users to backend (non-blocking)
  if (userId && sessionClaims) {
    // Don't await - let it run in background without blocking the request
    syncUserToBackend(userId, sessionClaims as SessionClaims).catch(error => {
      console.error('Background user sync error:', error)
    })
  }

  return NextResponse.next()
})

// Async function to sync user data to backend (runs in background)
async function syncUserToBackend(userId: string, sessionClaims: SessionClaims) {
  // Only sync if we have a backend URL configured
  const HTTP_BACKEND = process.env.HTTP_BACKEND || process.env.NEXT_PUBLIC_HTTP_BACKEND
  if (!HTTP_BACKEND) {
    console.log('No backend URL configured, skipping user sync')
    return
  }

  try {
    const response = await fetch(`${HTTP_BACKEND}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clerkId: userId,
        email: sessionClaims.email,
        name: `${sessionClaims.first_name || ''} ${sessionClaims.last_name || ''}`.trim(),
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to sync user:', response.status, await response.text());
    } else {
      console.log('User synced successfully:', userId)
    }
  } catch (error) {
    // Don't throw - backend sync failures should not affect user experience
    console.error('Error syncing user to backend:', error);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}