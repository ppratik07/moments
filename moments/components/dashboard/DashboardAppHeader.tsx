'use client';

import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MemoryLaneLogo } from '@/components/brand/MemoryLaneLogo';
import { Plus } from 'lucide-react';

type DashboardAppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function DashboardAppHeader({ title = 'Your Projects', subtitle }: DashboardAppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 h-20 flex items-center justify-between gap-4">
        <MemoryLaneLogo />

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push('/new-project')}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-4 sm:px-5 py-2.5 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors shadow-[0_2px_8px_-2px_rgba(154,65,17,0.25)]"
          >
            <Plus className="w-4 h-4" aria-hidden />
            <span className="sm:hidden">New project</span>
            <span className="hidden sm:inline">Create New Project</span>
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {(title || subtitle) && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 pb-8 pt-2">
          <p className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest mb-2">Your studio</p>
          <h1 className="font-headline-lg text-[var(--color-on-surface)]">{title}</h1>
          {subtitle && <p className="font-body-md text-[var(--color-on-surface-variant)] mt-2 max-w-2xl">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
