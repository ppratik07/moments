import { MaterialSymbol } from './MaterialSymbol';

const steps = [
  {
    num: '01',
    icon: 'send',
    title: 'Invite Contributors',
    description:
      'Share your private keepsake link via 1-click text, email batch, or instant WhatsApp invite. Set an optional deadline for contributions.',
    mock: (
      <div className="bg-[var(--color-surface-container)] rounded-lg p-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <MaterialSymbol name="link" className="text-[16px] text-[var(--color-primary)] shrink-0" />
          <span className="font-body-sm text-[var(--color-on-surface)] truncate">memorylane.studio/dads-70th</span>
        </div>
        <span className="bg-[var(--color-surface)] px-1.5 py-1 rounded text-[var(--color-primary)] font-label-md shrink-0">Copy Link</span>
      </div>
    ),
    badgeClass: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  },
  {
    num: '02',
    icon: 'add_a_photo',
    title: 'Collect Photos & Messages',
    description:
      'Zero barrier to entry. Friends tap the link, answer thoughtful prompts, attach candid memories, and submit in seconds without a password.',
    mock: (
      <div className="bg-[var(--color-surface-container)] rounded-lg p-1.5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-[11px] text-[var(--color-secondary)] uppercase font-bold">Prompt 1 of 3</span>
          <span className="font-body-sm text-[11px] text-[var(--color-on-surface-variant)]">No account needed</span>
        </div>
        <p className="font-title-editorial italic text-[var(--color-on-surface)]">&ldquo;What is your favorite memory of Arthur?&rdquo;</p>
      </div>
    ),
    badgeClass: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
  },
  {
    num: '03',
    icon: 'menu_book',
    title: 'Preview, PDF & Print',
    description:
      'Enjoy an interactive digital flip-book preview, rearrange spreads effortlessly, download high-res PDF instantly, or order museum-grade hardcovers.',
    mock: (
      <div className="bg-[var(--color-surface-container)] rounded-lg p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MaterialSymbol name="verified_user" className="text-[var(--color-primary)] text-[18px]" />
          <span className="font-body-sm text-[var(--color-on-surface)] font-medium">Digital PDF + Hardcover</span>
        </div>
        <span className="font-label-md text-[var(--color-primary)] font-bold">Ready</span>
      </div>
    ),
    badgeClass: 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]',
  },
];

export function StitchHowItWorksSection() {
  return (
    <section className="w-full bg-[var(--color-surface-container-low)] px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
        <div className="flex flex-col items-center text-center gap-1.5 max-w-2xl mx-auto">
          <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest">EFFORTLESS COLLABORATION</span>
          <h2 className="font-headline-lg text-[var(--color-on-surface)]">How a Whole Community Builds One Timeless Book</h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)]">
            No sign-ups or software downloads required for your guests. We made contributing as easy as sending a text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-[var(--color-surface)] rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className={`w-10 h-10 rounded-full ${step.badgeClass} font-headline-sm flex items-center justify-center font-normal`}>{step.num}</span>
                  <MaterialSymbol name={step.icon} className="text-[var(--color-secondary)] text-[24px]" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-[var(--color-on-surface)] mb-1">{step.title}</h3>
                  <p className="font-body-md text-[var(--color-on-surface-variant)]">{step.description}</p>
                </div>
              </div>
              {step.mock}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
