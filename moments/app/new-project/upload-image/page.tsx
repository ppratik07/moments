'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import '@/app/stitch-landing.css';
import { StudioAppHeader } from '@/components/dashboard/StudioAppHeader';
import { ArrowRight } from 'lucide-react';

export default function AddPhoto() {
  const { isSignedIn, isLoaded } = useCurrentUser();
  const router = useRouter();
  const { projectName, imageKey, projectId } = useProjectStore();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!projectId) {
      toast.error('Start from step 1 to create your project first.');
      router.replace('/new-project');
    }
  }, [isLoaded, isSignedIn, projectId, router]);

  const handleNext = () => {
    if (!projectName) {
      toast.error('No project name set!');
      router.push('/new-project');
      return;
    }
    if (!imageKey) {
      toast.error('Please upload a photo first');
      return;
    }
    router.push(`/new-project/upload-image/${encodeURIComponent(projectName)}`);
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    router.replace('/new-project');
    return null;
  }

  return (
    <div className="stitch-landing min-h-screen bg-[var(--color-surface-container-low)]">
      <StudioAppHeader backHref="/new-project" backLabel="Project details" />

      <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 pb-16 pt-8 md:pt-10">
        <div className="mb-8">
          <p className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest mb-2">Step 2 of 2</p>
          <h1 className="font-headline-lg text-[var(--color-on-surface)] mb-2">Add a cover photo</h1>
          <p className="font-body-md text-[var(--color-on-surface-variant)] max-w-xl">
            Choose the first image for <span className="font-medium text-[var(--color-on-surface)]">{projectName || 'your book'}</span>.
            This appears on your dashboard and helps contributors connect with the story.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)]/50 shadow-sm p-6 sm:p-8">
          <ImageUploader
            onUploadSuccess={(key) => useProjectStore.getState().setImageKey(key)}
            label="Tap to upload a photo"
            variant="studio"
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-8 py-3.5 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors shadow-[0_4px_12px_-2px_rgba(154,65,17,0.25)]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/new-project')}
              className="font-label-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] py-3"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
