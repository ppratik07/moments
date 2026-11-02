import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

type MemoryLaneLogoProps = {
  className?: string;
  showWordmark?: boolean;
  href?: string;
};

export function MemoryLaneLogo({ className, showWordmark = true, href = '/' }: MemoryLaneLogoProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 shrink-0', className)}>
      <div
        className="w-9 h-9 rounded-lg bg-[var(--color-primary-fixed)] flex items-center justify-center text-[var(--color-primary)] shadow-sm"
        aria-hidden
      >
        <BookOpen className="w-5 h-5" strokeWidth={2.25} />
      </div>
      {showWordmark && (
        <span className="font-title-editorial text-[var(--color-primary)] tracking-tight font-medium">MemoryLane</span>
      )}
    </Link>
  );
}
