// components/TipsBox.tsx
import { Button } from "@/components/ui/button";
// import ChatSupportButton from "../ChatSupportButton";

type TipsBoxProps = {
    onNextClick?: () => void; // Make onNextClick optional
};

export default function TipsBox({ onNextClick }: TipsBoxProps) {
    return (
        <div className="mt-8 flex w-full flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-2xl flex-1 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm shadow-sm">
                <p className="font-label-lg text-[var(--color-on-surface)]">
                    <strong>Tips:</strong>
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 font-body-md text-[var(--color-on-surface-variant)]">
                    <li>
                        Want to write a longer message?{' '}
                        <span className="text-[var(--color-on-surface-variant)]/80">
                            Simply choose a different layout.
                        </span>
                    </li>
                    <li>
                        Want to add more photos?{' '}
                        <span className="text-[var(--color-on-surface-variant)]/80">Add another page</span>
                    </li>
                </ol>
            </div>

            {onNextClick && (
                <Button
                    type="button"
                    className="shrink-0 rounded-lg bg-[var(--color-primary)] px-8 font-label-lg text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)] sm:min-w-[120px]"
                    onClick={onNextClick}
                >
                    Next
                </Button>
            )}
        </div>
    );
}