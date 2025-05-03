'use client'
import DashboardCard from "@/components/dashboard/DashBoardCard";
import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUserProjects } from "@/hooks/useUserProject";
import { useContributionCount } from "@/hooks/useContributionCount";
import { useDeadline } from "@/hooks/useDeadline";
import { useLastContribution } from "@/hooks/useLastContribution";
import { useProjectStatus } from "@/hooks/useProjectStatus";
import { HTTP_BACKEND } from "@/utils/config";
import { useAuth } from "@clerk/nextjs";

export default function ProjectIdDashboard() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { imageKey, projectName } = useProjectStore();
  useUserProjects();
  const { contributionCount } = useContributionCount(projectId);
  const { deadlineDate, daysLeft, isDeadlineApproaching } = useDeadline(projectId);
  const { lastContributionDate } = useLastContribution(projectId);
  const { projectStatus } = useProjectStatus(projectId);
  const isReviewingState = daysLeft === 0 && projectStatus?.status !== 'printing';
  const isPrintingState = projectStatus?.status === 'printing';
  const router = useRouter();
  const { getToken } = useAuth();

  // Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');

  // Handle navigation to settings page
  const handleChangeDeadline = () => {
    router.push(`/dashboard/${projectId}/settings`);
  };

  // Social sharing
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out my memory book project on Moments Memory Books!`);
    const url = encodeURIComponent('https://momentsmemorybooks.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent('https://momentsmemorybooks.com');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent('https://momentsmemorybooks.com');
    const title = encodeURIComponent('My Memory Book Project');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
  };

  // Handle feedback submission
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

  return (
    <div>
      <input type="hidden" value={projectId} />
      <Header isSignedIn={true} />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar imageKey={imageKey} />
        <main className="w-full max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{projectName}</h1>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-md">
              Order Book
            </button>
          </div>

          {isPrintingState ? (
            <div className="bg-white border rounded-lg p-12 mt-10 space-y-12 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Your Book is Being Printed!</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your order has been placed, and your memory book is in production. Below is a summary of your order.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                {projectStatus?.orderSummary ? (
                  <div className="text-sm text-gray-600">
                    <p>Order ID: {projectStatus.orderSummary.orderId}</p>
                    <p>Order Date: {new Date(projectStatus.orderSummary.orderDate).toLocaleDateString()}</p>
                    <p>Total: ${projectStatus.orderSummary.total.toFixed(2)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Loading order details...</p>
                )}
              </div>

              <div className="space-y-4">
                <Button
                  className="px-6 py-2 bg-purple-600 text-white rounded-md"
                  onClick={() => router.push(`/dashboard/${projectId}/book/online`)}
                >
                  View Book Online
                </Button>
                <Button
                  className="px-6 py-2 bg-purple-600 text-white rounded-md ml-4"
                  onClick={() => router.push(`/dashboard/${projectId}/orders/details`)}
                >
                  View Order Details
                </Button>
                <Button
                  className="px-6 py-2 bg-purple-600 text-white rounded-md ml-4"
                  onClick={() => setIsFeedbackModalOpen(true)}
                >
                  Let Us Know
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Share Your Experience</h3>
                <div className="flex gap-4">
                  <Button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={shareOnTwitter}>
                    Share on Twitter
                  </Button>
                  <Button className="px-4 py-2 bg-blue-800 text-white rounded-md" onClick={shareOnFacebook}>
                    Share on Facebook
                  </Button>
                  <Button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={shareOnLinkedIn}>
                    Share on LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          ) : !isReviewingState ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 mt-8">
                <DashboardCard
                  title="Contributions"
                  value={contributionCount !== null ? String(contributionCount) : "—"}
                  description={
                    isDeadlineApproaching && lastContributionDate
                      ? `Last contribution on ${lastContributionDate.toLocaleDateString()}`
                      : "View your completed contributions."
                  }
                  buttonText="View Contributions"
                  onButtonClick={() => router.push(`/dashboard/${projectId}/contributions`)}
                />
                <DashboardCard
                  title="Days Left to Contribute"
                  value={daysLeft !== null ? String(daysLeft) : "—"}
                  description={`Your current contribution deadline is ${
                    deadlineDate ? deadlineDate.toLocaleDateString() : "not set"
                  }. Need more time? Click below to change the contribution deadline.`}
                  buttonText="Change Deadline"
                  onButtonClick={handleChangeDeadline}
                  className={isDeadlineApproaching ? "border-red-500" : ""}
                  titleClassName={isDeadlineApproaching ? "text-red-500" : ""}
                />
              </div>
              <div className="mt-20">
                <h2 className="text-xl font-semibold">Share with Your Friends</h2>
                <p className="text-sm text-gray-600 mb-2">
                  Share this link with everyone you would like to contribute to your project.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value="https://momentsmemorybooks.com"
                    readOnly
                  />
                  <Button className="px-10">Copy</Button>
                </div>
              </div>

              <div className="mt-15">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Edit Sharing Page</h2>
                  <Button className="px-2">View/Edit Sharing Page</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You can edit the page your friends will see when they click the link you share with them.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white border rounded-lg p-12 mt-10 space-y-12 max-w-6xl mx-auto">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Time to Order Your Book!</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You are done gathering contributions and ready to order your book. This is what to do next.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Step 1 - Review Contributions</h3>
                      <p className="text-sm text-gray-600">
                        You can exclude or edit contributions if needed.
                      </p>
                    </div>
                    <button
                      className="px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/${projectId}/contributions`)}
                    >
                      Review Contributions
                    </button>
                  </div>

                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Step 2 - Customize Book</h3>
                      <p className="text-sm text-gray-600">
                        Your book is ready to print. But you can customize a number of aspects of the book if you want.
                      </p>
                    </div>
                    <button
                      className="px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/${projectId}/customize`)}
                    >
                      Customize Book
                    </button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Step 3 - Order Book</h3>
                      <p className="text-sm text-gray-600">
                        Preview a print ready version of your book and then place your order!
                      </p>
                    </div>
                    <button
                      className="px-4 py-1.5 border rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/${projectId}/preview`)}
                    >
                      Preview & Order
                    </button>
                  </div>
                </div>
                <div className="pt-6 border-t mt-6">
                  <h3 className="font-semibold text-lg">Need More Time?</h3>
                  <p className="text-sm text-gray-600">
                    Your contribution deadline has passed. Do you need more time to gather contributions? Click to change
                    the contribution deadline and allow more time.
                  </p>
                  <div className="mt-2">
                    <Button className="px-4 py-1.5 border cursor-pointer rounded-md text-sm" onClick={handleChangeDeadline}>
                      Change Deadline
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              rows={5}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Write your feedback here..."
            />
            <div className="flex justify-end gap-2">
              <Button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
                onClick={handleFeedbackSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}