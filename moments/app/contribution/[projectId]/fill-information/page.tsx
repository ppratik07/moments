'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContributionStepper } from '@/components/contribution/ContributionStepper';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import '@/app/stitch-landing.css';
import {
  studioFieldClassName,
  studioLabelClassName,
} from '@/components/dashboard/StudioAppHeader';
import { cn } from '@/lib/utils';
import { RotatingLines } from 'react-loader-spinner';

export default function YourInformationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contributionId = searchParams ? searchParams.get('contributionId') : null;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    relationship: '',
    excludeOnline: false,
    notifyMe: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const pathname = usePathname();
  const projectId = useMemo(() => {
    const parts = pathname?.split('/');
    const idIndex = (parts?.indexOf('contribution') ?? -1) + 1;
    return parts?.[idIndex] ?? null;
  }, [pathname]);
  const [projectName, setProjectName] = useState('');
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem('projectName');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setProjectName(parsed.projectName ?? '');
      } catch {
        /* ignore */
      }
    }
  }, []);

  const validate = () => {
    if (!form.firstName.trim()) {
      toast.error('First name is required.');
      return false;
    }
    if (!form.lastName.trim()) {
      toast.error('Last name is required.');
      return false;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('A valid email is required.');
      return false;
    }
    if (!form.relationship) {
      toast.error('Please select your relationship.');
      return false;
    }
    if (!contributionId) {
      toast.error('Missing contribution. Please go back and submit your pages again.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`${HTTP_BACKEND}/api/submit-information`, {
        ...form,
        projectId,
      });
      if (response.status !== 200) {
        toast.error('Failed to submit information.');
        return;
      }

      const fillYourDetailsId = response.data.user.id;
      const updateResponse = await axios.patch(
        `${HTTP_BACKEND}/api/update-contribution/${contributionId}`,
        { fillYourDetailsId }
      );

      if (updateResponse.status !== 200) {
        throw new Error(updateResponse.data.error || 'Failed to update contribution');
      }

      const sentEmail = await axios.post(`${HTTP_BACKEND}/api/email/contribution`, {
        email: form.email,
        projectName: projectName,
      });

      if (sentEmail.data.error) {
        throw new Error(sentEmail.data.error.message || 'Failed to send confirmation email!');
      }

      toast.success('Information submitted successfully!');
      setShowSuccessDialog(true);
    } catch (e) {
      toast.error(
        `Something went wrong while submitting. ${
          e instanceof Error ? e.message : 'Please try again later.'
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stitch-landing min-h-screen bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-container-low)]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <ContributionStepper currentStep={2} className="mb-6" />
        <div className="mb-8 h-px w-full bg-[var(--color-outline-variant)]/45" />

        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-4xl">
            Your Information
          </h1>
          <p className="mt-3 max-w-xl font-body-md leading-relaxed text-[var(--color-on-surface-variant)]">
            Add your name and email to save your work and edit it later, and so your project
            organizer can contact you.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={studioLabelClassName()}>
                First Name
              </label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={cn(studioFieldClassName(), 'mt-2')}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className={studioLabelClassName()}>
                Last Name
              </label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={cn(studioFieldClassName(), 'mt-2')}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={studioLabelClassName()}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={cn(studioFieldClassName(), 'mt-2')}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="relationship" className={studioLabelClassName()}>
              Relationship (How do you know?)
            </label>
            <Select onValueChange={(value) => handleChange('relationship', value)}>
              <SelectTrigger
                id="relationship"
                className={cn(
                  studioFieldClassName(),
                  'mt-2 h-auto py-3 data-[placeholder]:text-[var(--color-on-surface-variant)]/70'
                )}
              >
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Coworker">Coworker</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 rounded-xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-lowest)]/80 p-5">
            <div className="flex items-start gap-3">
              <Checkbox
                id="exclude"
                checked={form.excludeOnline}
                onCheckedChange={(value) => handleChange('excludeOnline', !!value)}
                className="mt-0.5 border-[var(--color-outline-variant)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
              />
              <label htmlFor="exclude" className="font-body-md leading-snug text-[var(--color-on-surface)]">
                Exclude from online version of the book.{' '}
                <button
                  type="button"
                  className="font-label-lg text-[var(--color-primary)] underline-offset-2 hover:underline"
                  onClick={() => setShowLearnMore(true)}
                >
                  Learn More
                </button>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="notify"
                checked={form.notifyMe}
                onCheckedChange={(value) => handleChange('notifyMe', !!value)}
                className="mt-0.5 border-[var(--color-outline-variant)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
              />
              <label htmlFor="notify" className="font-body-md leading-snug text-[var(--color-on-surface)]">
                Notify me of promotions and upcoming events that might work well for a memory
                book.
              </label>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-8 font-label-lg text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RotatingLines
                    visible
                    width="20"
                    strokeColor="currentColor"
                    strokeWidth="5"
                    ariaLabel="Submitting"
                  />
                  Submitting…
                </>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-md border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[var(--color-on-surface)]">
              Online book exclusion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 font-body-md leading-relaxed text-[var(--color-on-surface-variant)]">
            <p>
              When the physical memory book is purchased by your project organizer, an online
              version of the book is made available as well. This online version can be shared
              with family and friends by the project organizer.
            </p>
            <p>
              If your contribution is more sensitive, you can exclude it from the online version
              of the book if you don&apos;t want others to read it.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open && projectId) {
            router.push(`/thank-you/${projectId}`);
          }
        }}
      >
        <DialogContent className="max-w-md border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[var(--color-on-surface)]">
              Thank you!
            </DialogTitle>
          </DialogHeader>
          <p className="font-body-md text-[var(--color-on-surface-variant)]">
            Your contribution and contact details were saved. We&apos;ve sent a confirmation to{' '}
            {form.email || 'your email'}.
          </p>
          <Button
            type="button"
            className="mt-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)]"
            onClick={() => {
              setShowSuccessDialog(false);
              if (projectId) router.push(`/thank-you/${projectId}`);
            }}
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
