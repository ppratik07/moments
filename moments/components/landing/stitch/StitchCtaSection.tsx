'use client';

import { useRouter } from 'next/navigation';
import { MaterialSymbol } from './MaterialSymbol';

export function StitchCtaSection() {
  const router = useRouter();

  return (
    <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 pb-16 md:pb-20 lg:pb-24" id="start">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-[var(--color-secondary-fixed)] via-[var(--color-primary-fixed)] to-[var(--color-surface-container)] rounded-[24px] p-8 lg:p-16 overflow-hidden shadow-lg">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[var(--color-primary)]/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto gap-3">
            <span className="font-label-eyebrow uppercase text-[var(--color-primary)] tracking-widest bg-[var(--color-surface)]/70 px-3 py-1 rounded-full">
              START IN 30 SECONDS
            </span>
            <h2 className="font-headline-lg lg:text-[48px] lg:leading-[56px] text-[var(--color-on-surface)] tracking-tight">
              Create something meaningful together.
            </h2>
            <p className="font-body-lg text-[var(--color-on-surface-variant)]">
              Gather your people, compile their fondest memories, and place a lifetime of gratitude directly into their hands.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push('/new-project')}
                className="inline-flex items-center gap-1.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-8 py-3.5 rounded-lg hover:bg-[var(--color-primary-container)] transition-all shadow-[0_4px_16px_-2px_rgba(154,65,17,0.3)] hover:scale-[1.02]"
              >
                <span>Start Your Book</span>
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </button>
              <a
                href="#occasions"
                className="inline-flex items-center gap-1.5 bg-[var(--color-surface)] text-[var(--color-on-surface)] font-label-lg px-8 py-3.5 rounded-lg hover:bg-[var(--color-surface-container-high)] transition-all"
              >
                <MaterialSymbol name="collections_bookmark" className="text-[18px] text-[var(--color-secondary)]" />
                <span>Explore Sample Books</span>
              </a>
            </div>
            <span className="font-body-sm text-[var(--color-on-surface-variant)] pt-2">No credit card needed to begin collecting memories.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
