'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { STITCH_IMAGES } from '@/lib/stitch/images';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const navLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#occasions', label: 'Occasions' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function StitchHeader() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useCurrentUser();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src={STITCH_IMAGES.logo} alt="MemoryLane Logo" width={32} height={32} className="h-8 w-auto object-contain" />
          <span className="font-title-editorial text-[var(--color-primary)] tracking-tight font-medium">MemoryLane</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 lg:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--color-on-surface-variant)] font-label-lg hover:text-[var(--color-on-surface)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 lg:gap-5">
          {isLoaded && isSignedIn ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="hidden sm:inline-flex text-[var(--color-on-surface-variant)] font-label-lg hover:text-[var(--color-on-surface)] transition-colors px-1.5 py-1.5"
              >
                Dashboard
              </button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="hidden sm:inline-flex text-[var(--color-on-surface-variant)] font-label-lg hover:text-[var(--color-on-surface)] transition-colors px-1.5 py-1.5"
                >
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="inline-flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-5 py-2 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors shadow-[0_2px_8px_-2px_rgba(30,41,59,0.04)]"
                >
                  Start Your Book
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
