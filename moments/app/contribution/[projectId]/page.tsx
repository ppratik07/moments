'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/helpers/getImageUrl';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import ChatSupportButton from '@/components/ChatSupportButton';

export default function ContributionPage() {
    const { projectId } = useParams();

    interface ProjectData {
        projectName: string;
        eventDescription: string;
        imageKey?: string;
    }

    const [projectData, setProjectData] = useState<ProjectData | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem(`project-${projectId}`);
        if (raw) setProjectData(JSON.parse(raw));
    }, [projectId]);

    if (!projectData) return <p className="p-10">Loading project...</p>;

    return (
        <div>
            <Header isSignedIn={false} />
            <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-20">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Hero */}
                    <section className="py-12 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {projectData.projectName}
                            </h1>
                            <p className="text-gray-700 text-lg mb-4">
                                {projectData.eventDescription}
                            </p>
                            <div className="mt-6 space-x-4">
                                <button className="bg-white border text-purple-600 rounded-xs px-4 py-2 hover:shadow">
                                    How it Works
                                </button>
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-xs hover:bg-purple-700">
                                    Contribute
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            {projectData.imageKey && (
                                <Image
                                    src={getImageUrl(projectData.imageKey) ?? ''}
                                    alt="Event"
                                    width={600}
                                    height={400}
                                    className="rounded-lg"
                                />
                            )}
                        </div>
                    </section>

                    {/* Stepper */}
                    <div className="mb-4 flex justify-center items-center h-12">
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <span className="text-purple-600 font-semibold">Contribute</span>
                            <span>›</span>
                            <span>Your Information</span>
                            <span>›</span>
                            <span>Done</span>
                        </div>
                    </div>

                    {/* Contribute Instructions */}
                    <section className="mb-16 mt-6">
                        <h2 className="text-4xl font-bold mb-7">Contribute</h2>
                        <ol className="text-gray-700 list-decimal list-inside mb-6">
                            <li>
                                &nbsp;Click <strong>Add Text</strong> in the layout below to add a memory you have of John. It could be a funny memory, or something that was meaningful to you, or
                                <p className="ml-6 mb-4"> something fun or adventurous you did together! If a memory does not come mind, you could also just add a personal message to John of anything you would like to say.</p>
                            </li>
                            <li>
                                &nbsp;Click <strong>Add a Photo</strong> to add a photo of you and John, or of a memory, or another photo that you like.
                            </li>
                        </ol>

                        {/* Contribution Block */}

                        {/* Contribution Layout Card */}
                        <div className="border rounded-xl bg-white shadow-md px-6 py-4 w-full max-w-md mx-auto">
                            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                John Smith
                                <button className="text-purple-600 text-sm underline">✎</button>
                            </div>

                            {/* Page Layout */}
                            <div className="w-full border rounded-lg overflow-hidden">
                        
                                <div className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm">
                                    <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                                    <div className="relative z-10 text-center">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD A PHOTO
                                    </div>
                                </div>

                        
                                <div className="bg-gray-50 border-t px-4 py-6 text-center text-gray-700 font-medium text-sm relative">
                                    <div className="absolute inset-0 opacity-10 bg-[url('/lined-texture.svg')] bg-repeat" />
                                    <div className="relative z-10">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between text-sm text-purple-600 underline">
                                <button>View other layouts</button>
                                <button>Add another page</button>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button className="bg-primary hover:bg-purple-700">
                                Next
                            </Button>
                        </div>
                    </section>
                    <ChatSupportButton title='Chat with Support' />
                </div>
            </div>
        </div>
    );
}
