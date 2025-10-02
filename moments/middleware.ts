import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { HTTP_BACKEND } from "@/utils/config";
import { NextRequest } from 'next/server'

// Define session claims interface
interface SessionClaims {
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

// Define protected routes
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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Get authentication state after protection check
  const authObject = await auth()
  const { userId, sessionClaims } = authObject

  // Sync authenticated users to backend
  if (userId && sessionClaims) {
    // Use async function to handle user sync
    syncUserToBackend(userId, sessionClaims as SessionClaims).catch(error => {
      console.error('Error syncing user to backend:', error)
    })
  }
})

// Async function to sync user data to backend
async function syncUserToBackend(userId: string, sessionClaims: SessionClaims) {
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
      console.error('Failed to sync user:', await response.text());
    }
  } catch (error) {
    console.error('Error syncing user:', error);
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