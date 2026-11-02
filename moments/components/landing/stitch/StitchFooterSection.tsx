import Link from 'next/link';
import { MemoryLaneLogo } from '@/components/brand/MemoryLaneLogo';
import { MaterialSymbol } from './MaterialSymbol';

export function StitchFooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-surface-container-low)] mt-16 lg:mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-16 lg:mb-20">
          <div className="md:col-span-5 flex flex-col gap-3">
            <MemoryLaneLogo />
            <p className="font-headline-sm text-[var(--color-on-surface)] font-normal max-w-sm">Create memories together.</p>
            <p className="font-body-sm text-[var(--color-on-surface-variant)] max-w-sm">
              An archival memory studio for life&apos;s milestones—collecting photographs, heartfelt stories, and collective letters into enduring heirloom keepsakes.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-1">
            <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] mb-1">Explore</span>
            <div className="flex flex-col gap-1">
              <Link href="/about" className="font-body-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">About</Link>
              <Link href="/faqs" className="font-body-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">FAQs</Link>
              <a href="#occasions" className="font-body-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Occasions</a>
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col gap-1">
            <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] mb-1">Studio</span>
            <div className="flex flex-col gap-1">
              <Link href="/privacy-policy" className="font-body-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="font-body-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">Terms of Service</Link>
            </div>
            <div className="flex items-center gap-3 mt-3">
              {[
                { label: 'Archive Collections', icon: 'auto_stories' },
                { label: 'Customer Care', icon: 'mail' },
                { label: 'Gift Registry', icon: 'card_giftcard' },
              ].map((item) => (
                <a
                  key={item.icon}
                  href="#start"
                  aria-label={item.label}
                  className="w-9 h-9 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-colors"
                >
                  <MaterialSymbol name={item.icon} className="text-[20px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-1 text-[var(--color-on-surface-variant)]">
          <span className="font-body-sm">© {year} MemoryLane Studio. All rights reserved.</span>
          <span className="font-body-sm">Crafted for heirloom print & generational memories.</span>
        </div>
      </div>
    </footer>
  );
}
