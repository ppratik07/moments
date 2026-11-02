'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RotatingLines } from 'react-loader-spinner';
import { SignInButton } from '@clerk/nextjs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeliveryDate } from '@/hooks/useDeliveryDate';
import { HeadsUpModal } from '@/components/ModalPopup';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import '@/app/stitch-landing.css';
import { StudioAppHeader, studioFieldClassName, studioLabelClassName } from '@/components/dashboard/StudioAppHeader';
import { STITCH_IMAGES } from '@/lib/stitch/images';
import { cn } from '@/lib/utils';

export default function StartProjectForm() {
  const { isSignedIn, isLoaded } = useCurrentUser();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { calculatedDate, showHeadsUp } = useDeliveryDate(null);
  const [project, setProject] = useState('');
  const [bookName, setBookName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventsDescription, setEventsDescription] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const { setProjectName, setEventTypes } = useProjectStore();

  useEffect(() => {
    if (showHeadsUp) setShowModal(true);
  }, [showHeadsUp]);

  const handleEventTypeChange = async (name: string) => {
    setEventType(name);
    useProjectStore.setState({ eventTypes: name });
    setEventTypes(name);
    try {
      const res = await axios.get(`${HTTP_BACKEND}/event-type`, { params: { name } });
      if (res.data?.description) {
        setEventsDescription(res.data.description);
        useProjectStore.setState({ eventDescription: res.data.description });
      }
    } catch (error) {
      console.error('Error fetching event type description:', error);
      toast.error('Error fetching event description.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing: string[] = [];
    if (!project.trim()) missing.push('project name');
    if (!bookName.trim()) missing.push('who this book is for');
    if (!eventType) missing.push('event type');

    if (missing.length > 0) {
      toast.error(`Please enter ${missing.join(', ')}.`);
      return;
    }

    setIsSubmitting(true);
    setProgress(10);

    const token = await getToken();
    localStorage.setItem('token', token || '');

    try {
      setProgress(40);
      const response = await axios.post(
        `${HTTP_BACKEND}/api/users`,
        {
          projectName: project.trim(),
          bookName: bookName.trim(),
          dueDate: null,
          eventType,
          eventDescription: eventsDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            token: `Bearer ${token}`,
          },
        }
      );
      useProjectStore.getState().setProjectId(response.data.projectId);
      setProjectName(project.trim());
      setProgress(100);
      router.push('/new-project/upload-image');
    } catch (error) {
      console.error('Error Request', error);
      toast.error('Something went wrong. Please try again.');
      setProgress(0);
      localStorage.removeItem('token');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="stitch-landing min-h-screen bg-[var(--color-surface-container-low)] flex items-center justify-center">
        <p className="font-body-md text-[var(--color-on-surface-variant)]">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="stitch-landing min-h-screen bg-[var(--color-surface-container-low)]">
        <StudioAppHeader backHref="/" backLabel="Home" />
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="font-headline-lg text-[var(--color-on-surface)] mb-3">Sign in to get started</h1>
          <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8">
            Create a memory book project and invite others to contribute photos and messages.
          </p>
          <SignInButton mode="modal" forceRedirectUrl="/new-project">
            <button
              type="button"
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-8 py-3 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors"
            >
              Sign in
            </button>
          </SignInButton>
        </main>
      </div>
    );
  }

  return (
    <div className="stitch-landing min-h-screen bg-[var(--color-surface-container-low)]">
      <StudioAppHeader backHref="/dashboard" />

      {isSubmitting && (
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-4">
          <Progress value={progress} className="h-1.5 bg-[var(--color-surface-container)] [&>div]:bg-[var(--color-primary)]" />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 pb-16 md:pb-24 pt-8 md:pt-10 relative">
        <div className="relative w-full aspect-[21/9] max-h-72 rounded-2xl overflow-hidden shadow-[0_12px_32px_-6px_rgba(36,28,26,0.12)] mb-10">
          <Image
            src={STITCH_IMAGES.heroFamily}
            alt="Family celebrating together"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-inverse-surface)]/30 to-transparent" />
        </div>

        <div className="mb-10">
          <p className="font-label-eyebrow uppercase text-[var(--color-secondary)] tracking-widest mb-2">Step 1 of 2</p>
          <h1 className="font-display-hero text-[var(--color-on-surface)] tracking-tight mb-3">Get Started!</h1>
          <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
            We will walk you step-by-step through the simple process of setting up your memory book project.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)]/50 shadow-sm p-6 sm:p-8 md:p-10 space-y-6"
        >
          {isSubmitting && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--color-surface)]/85 backdrop-blur-[2px]"
              aria-live="polite"
              aria-busy="true"
            >
              <RotatingLines
                visible
                strokeColor="#9a4111"
                strokeWidth="4"
                width="56"
                ariaLabel="Creating project"
              />
              <p className="font-label-lg text-[var(--color-on-surface)]">Creating your project…</p>
            </div>
          )}

          <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0 m-0 space-y-6 disabled:opacity-70">
          <div>
            <h2 className="font-headline-sm text-[var(--color-primary)] mb-6">Project information</h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="projectName" className={studioLabelClassName()}>
                  Project name
                </label>
                <input
                  id="projectName"
                  type="text"
                  placeholder="Example: Uncle John's 50th Birthday"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className={studioFieldClassName()}
                />
              </div>

              <div>
                <label htmlFor="recipient" className={studioLabelClassName()}>
                  Who is this book for?
                </label>
                <input
                  id="recipient"
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="Person, couple, or group of people"
                  className={studioFieldClassName()}
                />
              </div>

              <div>
                <label htmlFor="eventType" className={studioLabelClassName()}>
                  Event type
                </label>
                <Select value={eventType} onValueChange={handleEventTypeChange}>
                  <SelectTrigger
                    className={cn(
                      studioFieldClassName(),
                      'h-auto min-h-11 w-full justify-between text-left [&>span]:w-full'
                    )}
                  >
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                  <SelectContent
                    sideOffset={6}
                    position="popper"
                    className="stitch-landing stitch-select-dropdown z-[100] max-h-[min(14rem,var(--radix-select-content-available-height))] overflow-y-auto overscroll-contain bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)] shadow-lg"
                  >
                    <SelectGroup>
                      <SelectLabel className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                        Special occasions
                      </SelectLabel>
                      {['Birthday', 'Wedding', 'Wedding Anniversary', 'Mother’s Day', 'Father’s Day', 'School Graduation', 'Memorial'].map(
                        (v) => (
                          <SelectItem key={v} value={v} className="font-body-md">
                            {v}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                        Farewell
                      </SelectLabel>
                      {['Off to College', 'Moving Away', 'Leaving on a Mission', 'Terminal Illness'].map((v) => (
                        <SelectItem key={v} value={v} className="font-body-md">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                        Other
                      </SelectLabel>
                      {['Support', 'Get Well', 'Thank You', 'Just Because'].map((v) => (
                        <SelectItem key={v} value={v} className="font-body-md">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-8 py-3.5 rounded-lg hover:bg-[var(--color-primary-container)] transition-all shadow-[0_4px_12px_-2px_rgba(154,65,17,0.25)] disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px]"
            >
              {isSubmitting ? (
                <>
                  <RotatingLines
                    visible
                    strokeColor="currentColor"
                    strokeWidth="5"
                    width="22"
                    ariaLabel=""
                  />
                  Creating…
                </>
              ) : (
                'Create project'
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push('/dashboard')}
              className="font-label-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancel
            </button>
          </div>
          </fieldset>
        </form>
      </main>

      <HeadsUpModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        enteredDate={null}
        calculatedDate={calculatedDate}
      />
    </div>
  );
}
