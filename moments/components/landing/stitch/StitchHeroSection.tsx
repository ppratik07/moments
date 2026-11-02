'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { STITCH_IMAGES } from '@/lib/stitch/images';
import { MaterialSymbol } from './MaterialSymbol';

export function StitchHeroSection() {
  const router = useRouter();

  return (
    <section className="relative w-full overflow-hidden px-6 sm:px-10 lg:px-16 xl:px-20 pt-8 lg:pt-12 pb-16 md:pb-20 lg:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-4 z-10">
            <div className="inline-flex items-center gap-1.5 bg-[var(--color-surface-container-high)] px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span className="font-label-eyebrow uppercase text-[var(--color-primary)] tracking-wider">
                The #1 Group Keepsake Platform • Over 65,000 Milestone Stories Bound
              </span>
            </div>

            <h1 className="font-display-hero lg-display-hero text-[var(--color-on-surface)] tracking-tight">
              Create Beautiful Memory Books{' '}
              <span className="italic text-[var(--color-primary)]">Together.</span>
            </h1>

            <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
              MemoryLane lets you invite friends, family, and colleagues from across the globe to contribute heartfelt photos, audio notes, and written memories into an heirloom keepsake book for life&apos;s unforgettable moments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push('/new-project')}
                className="inline-flex items-center gap-1.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-5 py-3 rounded-lg hover:bg-[var(--color-primary-container)] transition-all duration-300 shadow-[0_4px_16px_-2px_rgba(154,65,17,0.3)] hover:scale-[1.02]"
              >
                <span>Start Your Book</span>
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </button>
              <a
                href="#occasions"
                className="inline-flex items-center gap-1.5 bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-label-lg px-5 py-3 rounded-lg hover:bg-[var(--color-surface-container-high)] transition-all duration-300"
              >
                <MaterialSymbol name="menu_book" className="text-[18px] text-[var(--color-secondary)]" />
                <span>See Examples</span>
              </a>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[var(--color-on-surface-variant)]">
              <MaterialSymbol name="verified" className="text-[16px] text-[var(--color-secondary)]" />
              <span className="font-body-sm">
                No design skills required • Easy to share via link • Free instant PDF & optional hardcover print
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative mt-5 lg:mt-0">
            <div className="relative w-full aspect-[4/3] max-w-xl mx-auto flex items-center justify-center">
              <div className="absolute -inset-6 bg-[var(--color-secondary-fixed)]/40 rounded-full blur-3xl -z-10 transform rotate-12" />

              <div className="relative w-full h-[88%] bg-[var(--color-surface-container-lowest)] rounded-xl shadow-[0_24px_48px_-12px_rgba(30,41,59,0.18)] p-3 flex transform -rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                <div className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-[var(--color-surface-dim)]/40 via-[var(--color-surface-container)]/60 to-[var(--color-surface-dim)]/40 z-20 pointer-events-none" />

                <div className="w-1/2 pr-3 flex flex-col justify-between relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-eyebrow uppercase text-[var(--color-secondary)]">Page 14 • Family Letters</span>
                      <span className="font-body-sm text-[var(--color-on-surface-variant)]">1984 – 2024</span>
                    </div>
                    <div className="w-full aspect-[16/10] rounded-lg overflow-hidden bg-[var(--color-surface-container-low)] shadow-sm relative">
                      <Image src={STITCH_IMAGES.heroFamily} alt="Multi-generational family on a sunlit porch" fill className="object-cover" sizes="(max-width:768px) 50vw, 300px" />
                    </div>
                    <p className="font-title-editorial italic text-[var(--color-primary)] leading-snug line-clamp-2">
                      &ldquo;Dad, your guidance taught three generations how to live with laughter and kindness...&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary-fixed)] flex items-center justify-center font-label-md text-[var(--color-on-secondary-fixed)]">M</div>
                    <span className="font-body-sm text-[var(--color-on-surface-variant)] italic">— Margaret & the kids</span>
                  </div>
                </div>

                <div className="w-1/2 pl-3 flex flex-col justify-between relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-eyebrow uppercase text-[var(--color-secondary)]">Tributes</span>
                      <span className="font-body-sm text-[var(--color-on-surface-variant)]">Page 15</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-surface-container)] shadow-sm relative">
                        <Image src={STITCH_IMAGES.heroGrandpa} alt="Grandfather laughing with granddaughter" fill className="object-cover" sizes="150px" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-surface-container)] shadow-sm relative">
                        <Image src={STITCH_IMAGES.heroFriends} alt="Friends toasting at dinner" fill className="object-cover" sizes="150px" />
                      </div>
                    </div>
                    <div className="bg-[var(--color-surface-container-low)] p-1.5 rounded-lg">
                      <p className="font-body-sm text-[var(--color-on-surface)] leading-tight">
                        &ldquo;Thank you for 35 years of genuine mentorship, Arthur. You shaped who we are today.&rdquo;
                      </p>
                      <span className="font-label-md text-[var(--color-secondary)] block mt-1">Colleagues at Miller & Co.</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[var(--color-on-surface-variant)] font-label-md">
                    <span>Archival 170gsm Silk</span>
                    <MaterialSymbol name="auto_stories" className="text-[16px] text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-3 sm:left-2 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-[0_8px_20px_-4px_rgba(30,41,59,0.12)] flex items-center gap-1.5 z-30">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center font-label-md text-[var(--color-on-primary-fixed)]">EL</div>
                  <div className="w-7 h-7 rounded-full bg-[var(--color-secondary-fixed)] flex items-center justify-center font-label-md text-[var(--color-on-secondary-fixed)]">JH</div>
                  <div className="w-7 h-7 rounded-full bg-[var(--color-tertiary-fixed)] flex items-center justify-center font-label-md text-[var(--color-on-tertiary-fixed)]">AK</div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-[var(--color-on-surface)] flex items-center gap-1">
                    15 contributors
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </span>
                  <span className="font-body-sm text-[11px] text-[var(--color-on-surface-variant)] leading-none">3 letters added today</span>
                </div>
              </div>

              <div className="absolute -bottom-4 left-6 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-[0_8px_20px_-4px_rgba(30,41,59,0.12)] flex items-center gap-1.5 z-30">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-primary)]">
                  <MaterialSymbol name="book" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-[var(--color-on-surface)]">32 keepsake pages</span>
                  <span className="font-body-sm text-[11px] text-[var(--color-on-surface-variant)] leading-none">Museum-grade lay-flat binding</span>
                </div>
              </div>

              <div className="absolute -top-2 -right-2 sm:right-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-3 py-2 rounded-xl shadow-[0_8px_20px_-4px_rgba(154,65,17,0.3)] flex items-center gap-1.5 z-30">
                <MaterialSymbol name="celebration" className="text-[18px]" />
                <div className="flex flex-col">
                  <span className="font-label-md leading-none">Dad&apos;s 70th Milestone</span>
                  <span className="text-[11px] opacity-90 leading-tight">Retirement Gift Project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
