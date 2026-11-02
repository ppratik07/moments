import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from './SignatureEditModal';

interface PageNavigationProps {
  pages: Page[];
  activePage: number;
  setActivePage: (index: number) => void;
  addPage: () => void;
  handleDeletePage: (index: number) => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  activePage,
  setActivePage,
  addPage,
  handleDeletePage,
}) => (
  <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
    {pages.map((_, index) => (
      <button
        key={index}
        type="button"
        aria-label={`Go to page ${index + 1}`}
        aria-current={activePage === index ? 'step' : undefined}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all',
          activePage === index
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md ring-2 ring-[var(--color-primary)]/30'
            : 'border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/40'
        )}
        onClick={() => setActivePage(index)}
      >
        {index + 1}
      </button>
    ))}
    <button
      type="button"
      onClick={addPage}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-label-lg text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-container-low)]"
    >
      <Plus className="h-4 w-4" aria-hidden />
      Add another page
    </button>
    {pages.length > 1 && (
      <button
        type="button"
        onClick={() => handleDeletePage(activePage)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 font-label-lg text-red-600 transition-colors hover:bg-red-50"
        title="Delete current page"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Delete page</span>
      </button>
    )}
  </div>
);
