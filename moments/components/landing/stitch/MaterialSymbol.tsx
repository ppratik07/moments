import {
  ArrowRight,
  Book,
  BookOpen,
  Bookmark,
  Gift,
  ImagePlus,
  LayoutGrid,
  Library,
  Link2,
  Lock,
  Mail,
  PartyPopper,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  arrow_forward: ArrowRight,
  menu_book: BookOpen,
  verified: BadgeCheck,
  auto_stories: Library,
  book: Book,
  celebration: PartyPopper,
  send: Send,
  link: Link2,
  add_a_photo: ImagePlus,
  verified_user: ShieldCheck,
  grid_view: LayoutGrid,
  groups: Users,
  auto_awesome: Sparkles,
  lock: Lock,
  star: Star,
  collections_bookmark: Bookmark,
  mail: Mail,
  card_giftcard: Gift,
};

type MaterialSymbolProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

/** Stitch designs use Material icon names; we render Lucide equivalents (reliable without icon font). */
export function MaterialSymbol({ name, className, filled }: MaterialSymbolProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) {
    return null;
  }

  const sizeMatch = className?.match(/text-\[(\d+)px\]/);
  const size = sizeMatch ? Number(sizeMatch[1]) : 20;

  return (
    <Icon
      size={size}
      aria-hidden
      className={cn('shrink-0 inline-block', className)}
      fill={filled ? 'currentColor' : 'none'}
      strokeWidth={filled ? 0 : 2}
    />
  );
}
