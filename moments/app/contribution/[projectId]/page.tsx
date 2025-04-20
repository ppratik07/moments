'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/helpers/getImageUrl';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import ChatSupportButton from '@/components/ChatSupportButton';
import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';
import { DashboardModal } from '@uppy/react';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

export default function ContributionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signature, setSignature] = useState('Your Name Here');
    const [message, setMessage] = useState('');
    const [showUploader, setShowUploader] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const { projectId } = useParams();

    interface ProjectData {
        projectName: string;
        eventDescription: string;
        imageKey?: string;
    }
    const uppy = useMemo(() => {
        return new Uppy({
            restrictions: { maxNumberOfFiles: 1 },
            autoProceed: false,
        }).use(Transloadit, {
            key: 'SMO6nFCGrkeFYxVIXAgxaTOrYlNe70wU', // Replace this with your Transloadit API key
            assemblyOptions: {
                params: {
                    auth: {
                        key: 'SMO6nFCGrkeFYxVIXAgxaTOrYlNe70wU', // Add your Transloadit API key here
                    },
                    template_id: '5750d3cb5a3d41d188aebdbaf77f3f43', // Replace this with your template ID
                },
            },
        });
    }, []);
    useEffect(() => {
        uppy.on('complete', (result) => {
            const url = result.successful?.[0]?.uploadURL ?? null;
            if (url) {
                setUploadedImageUrl(url);
            }
            setShowUploader(false);
        });

        return () => uppy.destroy();
    }, [uppy]);

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
                                {signature}
                                <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                            </div>

                            {/* Page Layout */}
                            <div className="w-full border rounded-lg overflow-hidden">

                                <div
                                    className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                                    onClick={() => setShowUploader(true)}
                                >
                                    <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                                    <div className="relative z-10 text-center">
                                        {uploadedImageUrl ? (
                                            <Image src={uploadedImageUrl} alt="Uploaded" className="w-full h-full object-cover" width={500} height={300} />
                                        ) : (
                                            <>
                                                <div className="text-lg mb-1">⊕</div>
                                                ADD A PHOTO
                                            </>
                                        )}
                                    </div>
                                </div>


                                <div className="bg-gray-50 border-t px-4 py-6 text-center text-gray-700 font-medium text-sm relative">
                                    <div className="absolute inset-0 opacity-10 bg-[url('/lined-texture.svg')] bg-repeat" />
                                    <div className="relative z-10">
                                        {message ? (
                                            <p className="whitespace-pre-line text-sm">{message}</p>
                                        ) : (
                                            <>
                                                <div className="text-lg mb-1">⊕</div>
                                                ADD TEXT
                                            </>
                                        )}
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Edit Text</h2>

                        <label className="block mb-2 text-sm font-medium">Signature</label>
                        <input
                            className="w-full mb-4 p-2 border rounded"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                        />

                        <label className="block mb-2 text-sm font-medium">Message</label>
                        <textarea
                            className="w-full p-2 border rounded mb-4"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Save</Button>
                        </div>
                    </div>
                </div>
            )}
            <DashboardModal
                uppy={uppy}
                open={showUploader}
                onRequestClose={() => setShowUploader(false)}
                proudlyDisplayPoweredByUppy={false}
            />
        </div>
    );
}
