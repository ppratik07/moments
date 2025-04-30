'use client'
import DashboardCard from "@/components/dashboard/DashBoardCard";
import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { HTTP_BACKEND } from "@/utils/config";
import { useParams } from "next/navigation"
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function ProjectIdDashboard() {
    const params: Record<string, string | string[]> | null = useParams();
    const projectId = params ? params.id : undefined;
    const { imageKey, projectName } = useProjectStore();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${HTTP_BACKEND}/api/user-projects`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                const data = response.data;
                console.log(data);
            } catch (error) {
                console.error("Error fetching event type description:", error);
                toast.error("Error fetching event description.");
            }
        }
        fetchProjects();
    }, [])
    return (
        <div>
            <input type="hidden" value={projectId} />
            <Header isSignedIn={true} />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar imageKey={imageKey} />

                <main className="flex-1 p-8">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold">{projectName}</h1>
                        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-md">
                            Order Book
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 mt-8">
                        <DashboardCard
                            title="Contributions"
                            value="34"
                            description="View your completed contributions."
                            buttonText="View Contributions"
                        />
                        <DashboardCard
                            title="Days Left to Contribute"
                            value="08"
                            description="Your current contribution deadline is June 23, 2025. Need more time? Click below to change the contribution deadline."
                            buttonText="Change Deadline"
                        />
                    </div>


                    <div className="mt-20">
                        <h2 className="text-xl font-semibold">Share with Your Friends</h2>
                        <p className="text-sm text-gray-600 mb-2">Share this link with everyone you would like to contribute to your project.</p>
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

                </main>
            </div>
        </div>

    );
}