'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams?.get('redirect_url') || '/dashboard'

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        <SignIn
          afterSignInUrl={redirectUrl}
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border border-gray-200",
            }
          }}
          routing="hash"
        />
      </div>
    </div>
  )
}