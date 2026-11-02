import { MaterialSymbol } from './MaterialSymbol';

const features = [
  {
    icon: 'grid_view',
    title: 'Multiple Layout Options',
    description:
      'Pre-built editorial magazine and storybook spreads that auto-balance photos and long-form tributes without messy formatting headaches.',
  },
  {
    icon: 'groups',
    title: 'Unlimited Contributors',
    description:
      'Gather 5 or 500 loved ones seamlessly. Everyone receives their own dedicated prompt canvas without overlapping or clutter.',
  },
  {
    icon: 'auto_awesome',
    title: 'Occasion Templates',
    description:
      'Tailored prompt banks and aesthetic themes crafted specifically for milestone birthdays, retirements, anniversaries, and memorial celebrations.',
  },
  {
    icon: 'lock',
    title: 'Private & Secure',
    description:
      'Private invite-only access codes, SSL encrypted uploads, and strict personal privacy with zero advertisements or data selling.',
  },
];

export function StitchFeaturesSection() {
  return (
    <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24" id="features">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
        <div className="flex flex-col items-center text-center gap-1.5 max-w-2xl mx-auto">
          <span className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest">BUILT FOR MEANINGFUL TRIBUTES</span>
          <h2 className="font-headline-lg text-[var(--color-on-surface)]">Everything You Need to Create an Heirloom</h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)]">
            Carefully tuned features that make collecting from 5 to 500 people frictionless and beautifully structured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--color-surface-container-low)] rounded-xl p-6 md:p-8 flex flex-col gap-4 hover:translate-y-[-2px] transition-transform"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <MaterialSymbol name={feature.icon} className="text-[26px]" />
              </div>
              <div>
                <h3 className="font-headline-sm text-[var(--color-on-surface)] mb-2">{feature.title}</h3>
                <p className="font-body-md text-[var(--color-on-surface-variant)]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
