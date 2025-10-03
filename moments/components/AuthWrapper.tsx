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
  const [isStabilized, setIsStabilized] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    // Small delay to allow auth state to stabilize after OAuth redirect
    const timer = setTimeout(() => {
      setIsStabilized(true)
      
      if (requireAuth && !isSignedIn) {
        console.log('User not signed in, redirecting to sign-in')
        router.push('/sign-in')
        return
      }

      // Log successful authentication for debugging
      if (isSignedIn && user) {
        console.log('User authenticated successfully:', {
          userId,
          email: user.emailAddresses?.[0]?.emailAddress,
          name: user.fullName,
          provider: user.externalAccounts?.[0]?.provider || 'email',
          hasSession: !!userId
        })
      }
    }, 300) // Reduced from 500ms to 300ms for faster response

    return () => clearTimeout(timer)
  }, [isLoaded, isSignedIn, userId, user, requireAuth, router])

  // Show loading while checking auth state
  if (!isLoaded || !isStabilized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if auth is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}