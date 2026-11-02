import { MaterialSymbol } from './MaterialSymbol';

const testimonials = [
  {
    quote:
      "My mom cried tears of pure joy seeing letters from childhood friends she hadn't heard from in 20 years. The link made collecting messages so effortless!",
    initials: 'SJ',
    name: 'Sarah Jenkins',
    role: '50th Birthday Book Organizer',
    avatarClass: 'bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]',
  },
  {
    quote:
      'We organized a book for our grandparents with 48 family members contributing from 6 countries. The lay-flat print quality blew everyone away.',
    initials: 'MV',
    name: 'Marcus & Chloe Vance',
    role: 'Golden Wedding Anniversary',
    avatarClass: 'bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)]',
  },
  {
    quote:
      'Over 60 teammates submitted hilarious stories and photos. Setting it up took under 2 minutes, and the hardcover print arrived in just 4 days.',
    initials: 'DC',
    name: 'David Chen',
    role: 'Colleague Retirement Gift',
    avatarClass: 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]',
  },
];

export function StitchTestimonialsSection() {
  return (
    <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
        <div className="flex flex-col items-center text-center gap-1.5 max-w-3xl mx-auto">
          <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest">STORIES FROM REAL ORGANIZERS</span>
          <h2 className="font-headline-lg lg:text-[46px] lg:leading-[54px] text-[var(--color-on-surface)] italic font-display-hero">
            &ldquo;There wasn&apos;t a dry eye in the entire room.&rdquo;
          </h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)]">
            See why over 65,000 organizers trusted MemoryLane with their family&apos;s proudest moments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[var(--color-surface-container-low)] rounded-xl p-6 md:p-8 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex text-[var(--color-secondary)] mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MaterialSymbol key={i} name="star" className="text-[20px]" filled />
                  ))}
                </div>
                <p className="font-body-lg text-[var(--color-on-surface)] italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <div className={`w-10 h-10 rounded-full ${t.avatarClass} flex items-center justify-center font-label-lg font-bold`}>{t.initials}</div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-[var(--color-on-surface)]">{t.name}</span>
                  <span className="font-body-sm text-[var(--color-on-surface-variant)]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
