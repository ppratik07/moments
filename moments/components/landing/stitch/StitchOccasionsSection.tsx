import Image from 'next/image';
import Link from 'next/link';
import { STITCH_IMAGES } from '@/lib/stitch/images';
import { MaterialSymbol } from './MaterialSymbol';

const occasions = [
  {
    image: STITCH_IMAGES.occasionBirthday,
    alt: 'Joyful milestone birthday celebration with friends toasting',
    badge: '30th • 50th • 70th • 80th',
    title: 'Milestone Birthdays',
    description:
      'Surprise them with tributes from friends across four decades before the big party. A present that outshines every store-bought gift.',
    cta: 'Explore Birthday Prompts',
  },
  {
    image: STITCH_IMAGES.occasionWedding,
    alt: 'Elderly couple holding hands at golden anniversary',
    badge: 'Golden • Silver • Modern Guest Book',
    title: 'Weddings & Anniversaries',
    description:
      'A timeless alternative to hurried guest books. Gather candid photos and deep marriage wisdom from family near and far.',
    cta: 'Explore Wedding Books',
  },
  {
    image: STITCH_IMAGES.occasionRetirement,
    alt: 'Colleagues applauding a retiring mentor with a keepsake book',
    badge: 'Career Milestones • Send-offs',
    title: 'Retirement & Farewells',
    description:
      'Honor decades of mentorship with warm memories and best wishes from colleagues worldwide before they embark on their next adventure.',
    cta: 'Explore Retirement Prompts',
  },
  {
    image: STITCH_IMAGES.occasionBaby,
    alt: 'Newborn cradled by family hands',
    badge: 'First Year • Baby Shower',
    title: 'Baby Milestones',
    description:
      'Welcome new life with loving blessings, first-year predictions, and heartfelt letters from grandparents and aunties to read when grown.',
    cta: 'Explore Baby Books',
  },
  {
    image: STITCH_IMAGES.occasionMemorial,
    alt: 'Peaceful memorial display with portrait and dried flowers',
    badge: 'Memorial • Legacy Keepsake',
    title: 'Celebration of Life',
    description:
      'Preserve cherished lore, laughter, and generational legacy in an eternal heirloom book that comforts the family forever.',
    cta: 'Explore Memorial Prompts',
  },
  {
    image: STITCH_IMAGES.occasionMoving,
    alt: 'Friends laughing among moving boxes with photo albums',
    badge: 'Relocation • Bon Voyage',
    title: 'Moving Away & Friends',
    description:
      'Keep home close with favorite neighborhood memories, shared inside jokes, and warm parting wishes from friends across town.',
    cta: 'Explore Friendship Books',
  },
];

export function StitchOccasionsSection() {
  return (
    <section className="w-full bg-[var(--color-surface-container-low)] px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24" id="occasions">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
        <div className="flex flex-col items-center text-center gap-1.5 max-w-2xl mx-auto">
          <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest">EVERY MILESTONE DESERVES A KEEPSAKE</span>
          <h2 className="font-headline-lg text-[var(--color-on-surface)]">Crafted for Life&apos;s Unforgettable Chapters</h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)]">
            Explore tailor-made keepsake editions curated with thoughtful prompts for every milestone moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {occasions.map((item) => (
            <div key={item.title} className="bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="w-full h-48 overflow-hidden bg-[var(--color-surface-container)] relative">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:768px) 100vw, 400px"
                />
                <span className="absolute top-3 left-3 bg-[var(--color-surface)]/90 backdrop-blur-sm px-2.5 py-1 rounded-md font-label-md text-[var(--color-primary)] font-semibold">
                  {item.badge}
                </span>
              </div>
              <div className="p-6 md:p-8 flex flex-col gap-2 flex-grow justify-between">
                <div>
                  <h3 className="font-headline-sm text-[var(--color-on-surface)] mb-1">{item.title}</h3>
                  <p className="font-body-md text-[var(--color-on-surface-variant)]">{item.description}</p>
                </div>
                <Link
                  href="#start"
                  className="text-[var(--color-primary)] font-label-lg inline-flex items-center gap-1 hover:gap-2 transition-all pt-1.5"
                >
                  <span>{item.cta}</span>
                  <MaterialSymbol name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
