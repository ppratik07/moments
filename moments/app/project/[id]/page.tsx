'use client'
import DashboardCard from "@/components/dashboard/DashBoardCard";
import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { HTTP_BACKEND } from "@/utils/config";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export default function ProjectIdDashboard() {
    const params: Record<string, string | string[]> | null = useParams();
    const projectId = params ? params.id : undefined;
    const { imageKey, projectName } = useProjectStore();
    const [contributionCount, setContributionCount] = useState<number | null>(null);
    const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [isDeadlineApproaching, setIsDeadlineApproaching] = useState(false);
    const [lastContributionDate, setLastContributionDate] = useState<Date | null>(null);
    const isReviewingState = daysLeft === 0;
    const router = useRouter();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error("No token available");

                const response = await axios.get(`${HTTP_BACKEND}/api/user-projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data;
                console.log(data);
            } catch (error) {
                console.error("Error fetching event type description:", error);
                toast.error("Error fetching event description.");
            }
        };

        fetchProjects();
    }, [getToken]);

    useEffect(() => {
        const fetchContributionCount = async () => {
            if (!projectId) return;

            try {
                const token = await getToken();
                if (!token) throw new Error("No token available");

                const response = await axios.get(
                    `${HTTP_BACKEND}/contributions/count/${projectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setContributionCount(response.data.count);
            } catch (error) {
                console.error("Error fetching contribution count:", error);
                toast.error("Failed to load contribution count.");
            }
        };

        fetchContributionCount();
    }, [projectId, getToken]);

    useEffect(() => {
        const fetchDeadline = async () => {
            if (!projectId) return;

            try {
                const token = await getToken();
                if (!token) throw new Error('No token available');

                const response = await axios.get(
                    `${HTTP_BACKEND}/api/deadline/${projectId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const { deadline, deadline_enabled } = response.data;
                if (deadline_enabled && deadline) {
                    const parsedDeadline = new Date(deadline);
                    setDeadlineDate(parsedDeadline);

                    // Calculate days left
                    const now = new Date();
                    const diffTime = parsedDeadline.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysLeft(diffDays < 0 ? 0 : diffDays);

                    // Check if deadline is within 3 days
                    setIsDeadlineApproaching(diffDays > 0 && diffDays <= 3);
                }
            } catch (error) {
                console.error('Error fetching deadline:', error);
                toast.error('Failed to load deadline.');
            }
        };

        fetchDeadline();
    }, [projectId, getToken]);

    useEffect(() => {
        const fetchLastContribution = async () => {
            if (!projectId) return;

            try {
                const token = await getToken();
                if (!token) throw new Error("No token available");

                const response = await axios.get(
                    `${HTTP_BACKEND}/api/lastcontribution/${projectId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const { lastContributionDate } = response.data;
                if (lastContributionDate) {
                    setLastContributionDate(new Date(lastContributionDate));
                }
            } catch (error) {
                console.error("Error fetching last contribution:", error);
            }
        };

        fetchLastContribution();
    }, [projectId, getToken]);

    // Handle navigation to settings page
    const handleChangeDeadline = () => {
        router.push(`/dashboard/${projectId}/settings`);
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


                    {!isReviewingState ? (
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
                                    description={`Your current contribution deadline is ${deadlineDate ? deadlineDate.toLocaleDateString() : "not set"
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
                                    Your contribution deadline has passed. Do you need more time to gather contributions?
                                    Click to change the contribution deadline and allow more time.
                                </p>
                                <div className="mt-2">
                                    <button
                                        className="px-4 py-1.5 border cursor-pointer rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50"
                                        onClick={handleChangeDeadline}
                                    >
                                        Change Deadline
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </main>
            </div>
        </div>
    );
}
