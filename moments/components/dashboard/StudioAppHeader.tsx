'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MemoryLaneLogo } from '@/components/brand/MemoryLaneLogo';
import { ArrowLeft, Plus } from 'lucide-react';

type StudioAppHeaderProps = {
  showCreateButton?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function StudioAppHeader({
  showCreateButton = false,
  backHref = '/dashboard',
  backLabel = 'Back to projects',
}: StudioAppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between gap-4">
        <MemoryLaneLogo />

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={backHref}
            className="hidden sm:inline-flex items-center gap-1.5 font-label-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            {backLabel}
          </Link>
          {showCreateButton && (
            <button
              type="button"
              onClick={() => router.push('/new-project')}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-4 py-2.5 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">New project</span>
            </button>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

export function studioFieldClassName() {
  return 'w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 font-body-md text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] transition-shadow';
}

export function studioLabelClassName() {
  return 'font-label-lg text-[var(--color-on-surface)] mb-2 block';
}
