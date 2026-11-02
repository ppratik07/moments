import '@/app/stitch-landing.css';
import { StitchHeader } from './StitchHeader';
import { StitchHeroSection } from './StitchHeroSection';
import { StitchHowItWorksSection } from './StitchHowItWorksSection';
import { StitchFeaturesSection } from './StitchFeaturesSection';
import { StitchOccasionsSection } from './StitchOccasionsSection';
import { StitchTestimonialsSection } from './StitchTestimonialsSection';
import { StitchCtaSection } from './StitchCtaSection';
import { StitchFooterSection } from './StitchFooterSection';

export function StitchLandingPage() {
  return (
    <div className="stitch-landing min-h-screen">
      <StitchHeader />
      <main className="w-full pt-20 bg-[var(--color-surface)]">
        <div className="flex flex-col w-full">
          <StitchHeroSection />
          <StitchHowItWorksSection />
          <StitchFeaturesSection />
          <StitchOccasionsSection />
          <StitchTestimonialsSection />
          <StitchCtaSection />
        </div>
      </main>
      <StitchFooterSection />
    </div>
  );
}
