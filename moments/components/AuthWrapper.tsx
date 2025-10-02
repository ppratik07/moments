'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthWrapper({ children, requireAuth = false }: AuthWrapperProps) {
  const { isLoaded, userId, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    // Wait a bit for auth state to stabilize
    const timer = setTimeout(() => {
      setIsChecking(false)
      
      if (requireAuth && !isSignedIn) {
        router.push('/sign-in')
        return
      }

      // Ensure user data is properly loaded for Google OAuth
      if (isSignedIn && !user?.emailAddresses?.[0]?.emailAddress) {
        console.log('User signed in but email not loaded, waiting...')
        return
      }

      // Log successful authentication for debugging
      if (isSignedIn && user) {
        console.log('User authenticated successfully:', {
          userId,
          email: user.emailAddresses?.[0]?.emailAddress,
          name: user.fullName,
          provider: user.externalAccounts?.[0]?.provider || 'email'
        })
      }
    }, 500) // Small delay to let auth state stabilize

    return () => clearTimeout(timer)
  }, [isLoaded, isSignedIn, userId, user, requireAuth, router])

  // Show loading while checking auth state
  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect if auth is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}