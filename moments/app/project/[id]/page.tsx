'use client';
import DashboardCard from '@/components/dashboard/DashBoardCard';
import Sidebar from '@/components/dashboard/SideBar';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useContributionCount } from '@/hooks/useContributionCount';
import { useLastContribution } from '@/hooks/useLastContribution';
import { useProjectStatus } from '@/hooks/useProjectStatus';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';
import { shareOnFacebook, shareOnInstagram, shareOnTikTok, shareOnTwitter } from '@/services/social';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RotatingLines } from 'react-loader-spinner';
import { loadStripe } from '@stripe/stripe-js';

export default function ProjectIdDashboard() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { contributionCount } = useContributionCount(projectId);
  const { lastContributionDate } = useLastContribution(projectId);
  const { projectStatus } = useProjectStatus(projectId);
  const router = useRouter();
  const { getToken } = useAuth();

  // State for deadline and calendar popup
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectNames, setProjectNames] = useState<string | null>(null);
  const [imageKeys, setImageKeys] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;

  // Function to calculate days left
  const calculateDaysLeft = (deadline: Date | null) => {
    if (deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeDiff = deadline.getTime() - today.getTime();
      const calculatedDaysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setDaysLeft(calculatedDaysLeft >= 0 ? calculatedDaysLeft : 0);
    }
  };

  // Fetch project details and set deadline
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(`${HTTP_BACKEND}/api/user-projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const project = response.data.project;
        if (!project) {
          throw new Error('Project not found');
        }

        setProjectNames(project.projectName);
        setImageKeys(project.imageKey || null);

        let fetchedDeadline: Date | null = null;
        if (project.deadlineDate) {
          fetchedDeadline = new Date(project.deadlineDate);
          if (isNaN(fetchedDeadline.getTime())) {
            fetchedDeadline = null;
          }
        }

        if (!fetchedDeadline) {
          const creationDate = project.createdAt
            ? new Date(project.createdAt)
            : new Date();
          if (!isNaN(creationDate.getTime())) {
            fetchedDeadline = new Date(creationDate.getTime() + 31 * 24 * 60 * 60 * 1000);
            await axios.patch(
              `${HTTP_BACKEND}/api/user-projects/${projectId}`,
              { deadlineDate: fetchedDeadline.toISOString() },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }

        setDeadlineDate(fetchedDeadline);
        calculateDaysLeft(fetchedDeadline);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
        toast.error('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, getToken]);

  // Recalculate days left daily
  useEffect(() => {
    calculateDaysLeft(deadlineDate);
    const interval = setInterval(() => {
      calculateDaysLeft(deadlineDate);
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [deadlineDate]);

  // Handle deadline change
  const handleChangeDeadline = () => {
    setIsCalendarOpen(true);
  };

  // Handle date selection from calendar
  const handleDateSelect = async (date: Date | null) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error('Please select a future date.');
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      await axios.patch(
        `${HTTP_BACKEND}/api/user-projects/${projectId}`,
        { deadlineDate: date.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDeadlineDate(date);
      calculateDaysLeft(date);
      toast.success('Deadline updated successfully!');
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline.');
    } finally {
      setIsCalendarOpen(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackContent.trim()) {
      toast.error('Feedback cannot be empty.');
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      await axios.post(
        `${HTTP_BACKEND}/api/feedback`,
        { projectId, content: feedbackContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Feedback submitted successfully!');
      setFeedbackContent('');
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback.');
    }
  };

  const handleCopy = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(`${currentUrl.origin}/contribution/${projectId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      console.error('Stripe.js has not loaded');
      return;
    }
    const response = await axios.post(`${HTTP_BACKEND}/api/create-checkout-session`);
    const { id } = await response.data;
    const result = await stripe.redirectToCheckout({ sessionId: id });
    if (result.error) {
      console.error(result.error.message);
    }
  };

  const isDeadlineApproaching = daysLeft !== null && daysLeft <= 7;
  const isReviewingState = daysLeft === 0 && projectStatus?.status !== 'printing';
  const isPrintingState = projectStatus?.status === 'printing';

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <RotatingLines
          visible={true}
          strokeColor="gray"
          strokeWidth="5"
          animationDuration="0.75"
          width="64"
          ariaLabel="rotating-lines-loading"
        />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 p-4 text-center text-sm sm:text-base">Error: {error}</div>;
  }

  return (
    <div>
      <input type="hidden" value={projectId} />
      <Header isSignedIn={true} />
      <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50 pt-20">
        <Sidebar imageKey={imageKeys || ''} projectId={projectId} />
        <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">{projectNames}</h1>
            {/* Uncomment if Order Book button is needed */}
            {/* <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-md text-sm sm:text-base" onClick={handleCheckout}>
              Order Book
            </Button> */}
          </div>

          {isPrintingState ? (
            <div className="mt-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">View Book Online</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    While your book is being printed and shipped you can view and share the online version of the book with anyone.
                  </p>
                </div>
                <Button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => router.push(`/dashboard/${projectId}/book/online`)}
                >
                  View Book Online
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-white border rounded-lg p-4 sm:p-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-gray-600 text-sm sm:text-base">
                    <p>
                      <span className="font-medium">Date Ordered:</span>{' '}
                      {projectStatus?.orderSummary
                        ? format(new Date(projectStatus.orderSummary.orderDate), 'MM/dd/yyyy', { locale: enUS })
                        : 'Loading...'}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {projectStatus?.orderSummary ? 1 : '—'}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span>{' '}
                      {projectStatus?.orderSummary
                        ? `$${projectStatus.orderSummary.total.toFixed(2)}`
                        : '—'}
                    </p>
                    <p>
                      <span className="font-medium">Current Status:</span>{' '}
                      {projectStatus?.status === 'printing' ? 'Printing' : '—'}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-4">
                    Your book has been ordered and is currently being printed. Soon it will be shipped.
                  </p>
                  <Button
                    className="mt-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => router.push(`/dashboard/${projectId}/orders/details`)}
                  >
                    View Order Details
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Delighted with your experience?</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Your delight is our delight! If you loved your experience would you consider sharing your love online?
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Button
                      className="flex items-center justify-center px-3 py-2 bg-white border rounded-md text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                      onClick={shareOnFacebook}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" fill="#3b5998" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      className="flex items-center justify-center px-3 py-2 bg-white border rounded-md text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                      onClick={shareOnTwitter}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" fill="#000000" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X
                    </Button>
                    <Button
                      className="flex items-center justify-center px-3 py-2 bg-white border rounded-md text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                      onClick={shareOnTikTok}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" fill="#000000" viewBox="0 0 24 24">
                        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.53-1.54-.83-.45-2.16-.66-4.35-.64-6.53-.59-.02-1.18-.03-1.77-.03-3.31 0-6.62.01-9.93.02-.2 2.36-.36 4.73-.49 7.09-.07 1.29-.12 2.58-.12 3.87 0 1.48.55 2.95 1.62 4.02 1.07 1.07 2.54 1.62 4.02 1.62 1.29 0 2.58-.05 3.87-.12 2.36-.13 4.73-.29 7.09-.49v4.03c-2.36.2-4.73.36-7.09.49-1.29.07-2.58.12-3.87.12-3.31 0-6.62-.01-9.93-.02-.2-2.36-.36-4.73-.49-7.09-.07-1.29-.12-2.58-.12-3.87 0-3.31.01-6.62.02-9.93C5.84.01 7.14 0 8.44.02c1.29.01 2.58.02 3.87.03.02 2.18-.19 4.37-.64 6.53z" />
                      </svg>
                      TikTok
                    </Button>
                    <Button
                      className="flex items-center justify-center px-3 py-2 bg-white border rounded-md text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                      onClick={shareOnInstagram}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24">
                        <linearGradient id="instagram-gradient" x1="0" y1="0" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#feda75" />
                          <stop offset="25%" stopColor="#fa7e1e" />
                          <stop offset="50%" stopColor="#d62976" />
                          <stop offset="75%" stopColor="#962fbf" />
                          <stop offset="100%" stopColor="#4f5bd5" />
                        </linearGradient>
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="url(#instagram-gradient)" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth="2" fill="none" />
                        <circle cx="18" cy="6" r="1" fill="url(#instagram-gradient)" />
                      </svg>
                      Instagram
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Help Us Improve!</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    If you have some feedback for us on how we could do better, would you let us know here?
                  </p>
                </div>
                <Button
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => setIsFeedbackModalOpen(true)}
                >
                  Let Us Know
                </Button>
              </div>
            </div>
          ) : !isReviewingState ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <DashboardCard
                  title="Contributions"
                  value={contributionCount !== null ? String(contributionCount) : '—'}
                  description={
                    isDeadlineApproaching && lastContributionDate
                      ? `Last contribution on ${format(new Date(lastContributionDate), 'MM/dd/yyyy', { locale: enUS })}`
                      : 'View your completed contributions.'
                  }
                />
                <DashboardCard
                  title="Days Left to Contribute"
                  value={daysLeft !== null ? String(daysLeft) : '—'}
                  description={`Your current contribution deadline is ${deadlineDate ? format(deadlineDate, 'MM/dd/yyyy', { locale: enUS }) : 'not set'}. Need more time? Click below to change the contribution deadline.`}
                  buttonText="Change Deadline"
                  onButtonClick={handleChangeDeadline}
                  className={isDeadlineApproaching ? 'border-red-500' : ''}
                  titleClassName={isDeadlineApproaching ? 'text-red-500' : ''}
                />
              </div>
              <div className="mt-8 sm:mt-12">
                <h2 className="text-lg sm:text-xl font-semibold">Share with Your Friends</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Share this link with everyone you would like to contribute to your project.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={currentUrl ? `${currentUrl.origin}/contribution/${projectId}` : ''}
                    readOnly
                  />
                  <Button className="px-6 py-2 text-sm sm:text-base w-full sm:w-auto" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Link'}</Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white border rounded-lg p-6 sm:p-8 mt-6 space-y-8 max-w-6xl mx-auto">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Time to Order Your Book!</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    You are done gathering contributions and ready to order your book. This is what to do next.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Step 1 - Review Contributions</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        You can exclude or edit contributions if needed.
                      </p>
                    </div>
                    <button
                      className="mt-2 sm:mt-0 px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
                      onClick={() => router.push(`/dashboard/${projectId}/contributions`)}
                    >
                      Review Contributions
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Step 2 - Customize Book</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Your book is ready to print. But you can customize a number of aspects of the book if you want.
                      </p>
                    </div>
                    <button
                      className="mt-2 sm:mt-0 px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
                      onClick={() => router.push(`/dashboard/${projectId}/customize`)}
                    >
                      Customize Book
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h3 className="font-semibold text-lg">Step 3 - Order Book</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Preview a print ready version of your book and then place your order!
                      </p>
                    </div>
                    <button
                      className="mt-2 sm:mt-0 px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
                      onClick={() => router.push(`/dashboard/${projectId}/preview`)}
                    >
                      Preview & Order
                    </button>
                  </div>
                </div>
                <div className="pt-6 border-t mt-6">
                  <h3 className="font-semibold text-lg">Need More Time?</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your contribution deadline has passed. Do you need more time to gather contributions? Click to change
                    the contribution deadline and allow more time.
                  </p>
                  <div className="mt-2">
                    <Button className="px-4 py-1.5 border rounded-md text-sm w-full sm:w-auto" onClick={handleChangeDeadline}>
                      Change Deadline
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Popup */}
          {isCalendarOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Select New Deadline</h2>
                <DatePicker
                  selected={deadlineDate}
                  onChange={handleDateSelect}
                  minDate={new Date()}
                  inline
                  dateFormat="MM/dd/yyyy"
                  className="border rounded px-3 py-2 w-full text-sm"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    className="px-4 py-2 text-white rounded-md hover:bg-red-500 text-sm"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {isFeedbackModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Give Feedback</h2>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-4 text-sm"
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Write your feedback here..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm"
                    onClick={() => setIsFeedbackModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm"
                    onClick={handleFeedbackSubmit}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}