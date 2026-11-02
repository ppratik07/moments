import Link from 'next/link';
import { MemoryLaneLogo } from '@/components/brand/MemoryLaneLogo';

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-[#0f172a] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 [&_span]:text-white [&_svg]:text-[var(--color-primary-container)]">
              <MemoryLaneLogo />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              MemoryLane are the molecules that make up eternity. – Neal A. Maxwell
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/faqs" className="transition-colors hover:text-white">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Help and Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Chat with Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms-and-conditions" className="transition-colors hover:text-white">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500 sm:text-left">
          © {new Date().getFullYear()} Moments, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
