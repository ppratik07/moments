'use client';
import { BookOpen, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  isSignedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSignedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === '/';
  const isDashboardPage = pathname?.startsWith('/dashboard');

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header className="bg-gradient-to-b from-accent to-background fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-20">
            <Link href='/'>
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MemoryLane</span>
              </div>
            </Link>
            {isDashboardPage && (
              <div className="flex justify-between items-center mb-2">
                <Button
                  className="cursor-pointer"
                  onClick={() => router.push('/new-project')}
                >
                  Create New Project
                </Button>
              </div>
            )}
            {isLandingPage && (
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            {isLandingPage && (
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                  How It Works
                </a>
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Features
                </a>
                <a href="#occasions" className="text-sm font-medium hover:text-primary transition-colors">
                  Occasions
                </a>
                <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                  Testimonials
                </a>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        Log In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </SignUpButton>
                  </>
                )}
                {isSignedIn && (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm cursor-pointer font-medium"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>
      {/* Mobile Navigation Overlay */}
      {isLandingPage && isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <div className="flex flex-col p-6 space-y-6 text-center pt-20">
            <a
              href="#how-it-works"
              className="text-lg font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-lg font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#occasions"
              className="text-lg font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Occasions
            </a>
            <a
              href="#testimonials"
              className="text-lg font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <div className="flex flex-col space-y-4 pt-4">
              {isSignedIn ? (
                <>
                  <UserButton afterSignOutUrl="/" />
                  <Button
                    onClick={() => {
                      router.push('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};