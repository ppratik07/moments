import { cn } from '@/lib/utils';

const STEPS = ['Contribute', 'Your Information', 'Done'] as const;

type ContributionStepperProps = {
  currentStep: 1 | 2 | 3;
  className?: string;
};

export function ContributionStepper({ currentStep, className }: ContributionStepperProps) {
  return (
    <nav
      aria-label="Contribution progress"
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-2 gap-y-3 font-label-lg sm:justify-start',
        className
      )}
    >
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[var(--color-outline-variant)] select-none" aria-hidden>
                ›
              </span>
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  isComplete && 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
                  isActive &&
                    !isComplete &&
                    'border-2 border-[var(--color-primary)] bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)]',
                  !isActive &&
                    !isComplete &&
                    'border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface-variant)]'
                )}
                aria-hidden
              >
                {isComplete ? '✓' : stepNumber}
              </span>
              <span
                className={cn(
                  isActive || isComplete
                    ? 'font-semibold text-[var(--color-on-surface)]'
                    : 'text-[var(--color-on-surface-variant)]'
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
