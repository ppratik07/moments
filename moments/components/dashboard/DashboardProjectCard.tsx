'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { BookOpen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getImageUrl } from '@/helpers/getImageUrl';

type ProjectCardProps = {
  id: string;
  projectName: string;
  createdAt: string;
  imageKey?: string;
  onOpen: () => void;
  onDelete: () => void;
};

export function DashboardProjectCard({
  projectName,
  createdAt,
  imageKey,
  onOpen,
  onDelete,
}: ProjectCardProps) {
  const createdDate = new Date(createdAt);
  const isClosed = Date.now() - createdDate.getTime() > 365 * 24 * 60 * 60 * 1000;
  const tagLabel = isClosed ? 'Closed' : 'Active';

  const selectedCoverUrl = imageKey ? getImageUrl(imageKey) : null;
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setCoverFailed(false);
  }, [imageKey]);

  const showCoverImage = Boolean(selectedCoverUrl) && !coverFailed;

  return (
    <article className="group flex flex-col bg-[var(--color-surface-container-lowest)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)]/50 shadow-sm hover:shadow-[0_12px_32px_-6px_rgba(36,28,26,0.08)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="relative h-44 sm:h-48 overflow-hidden bg-[var(--color-surface-container)]">
        {showCoverImage && selectedCoverUrl ? (
          <Image
            src={selectedCoverUrl}
            alt={`Cover for ${projectName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 100vw, 400px"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]">
            <BookOpen className="w-10 h-10 text-[var(--color-primary)]/60" strokeWidth={1.5} />
            <span className="font-body-sm px-4 text-center">
              {imageKey ? 'Cover image unavailable' : 'Add a cover when you create your book'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-inverse-surface)]/40 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`font-label-md px-2.5 py-1 rounded-md backdrop-blur-sm ${
              isClosed
                ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
                : 'bg-[var(--color-secondary-container)]/90 text-[var(--color-on-secondary-container)]'
            }`}
          >
            {tagLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 left-3 z-10 w-9 h-9 rounded-lg bg-[var(--color-surface)]/90 backdrop-blur-sm flex items-center justify-center text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors shadow-sm"
          aria-label={`Delete ${projectName}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4">
        <div>
          <h2 className="font-headline-sm text-[var(--color-on-surface)] line-clamp-1">{projectName}</h2>
          <p className="font-body-sm text-[var(--color-on-surface-variant)] mt-1">
            Created {format(createdDate, 'MMMM d, yyyy')}
          </p>
        </div>

        <button
          type="button"
          disabled={isClosed}
          onClick={onOpen}
          className={`mt-auto w-full inline-flex items-center justify-center gap-2 font-label-lg py-3 rounded-lg transition-all ${
            isClosed
              ? 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] cursor-not-allowed'
              : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)] shadow-[0_4px_12px_-2px_rgba(154,65,17,0.25)]'
          }`}
        >
          <BookOpen className="w-4 h-4" aria-hidden />
          View Project
        </button>
      </div>
    </article>
  );
}
