// ContributionPage.tsx
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
import LayoutPickerModal from '@/components/LayoutPickerModel';
import { layoutCategories } from '@/components/getSelectedLayoutComponent'; 

export default function ContributionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signature, setSignature] = useState('Your Name Here');
    const [message, setMessage] = useState('');
    const [showUploader, setShowUploader] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState<number | null>(0); // Default to first layout
    const [editingMessage, setEditingMessage] = useState(false);

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
            key: 'SMO6nFCGrkeFYxVIXAgxaTOrYlNe70wU',
            assemblyOptions: {
                params: {
                    auth: { key: 'SMO6nFCGrkeFYxVIXAgxaTOrYlNe70wU' },
                    template_id: '5750d3cb5a3d41d188aebdbaf77f3f43',
                },
            },
        });
    }, []);

    useEffect(() => {
        uppy.on('complete', (result) => {
            const url = result.successful?.[0]?.uploadURL ?? null;
            if (url) setUploadedImageUrl(url);
            setShowUploader(false);
        });

        return () => uppy.destroy();
    }, [uppy]);

    const [projectData, setProjectData] = useState<ProjectData | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem(`project-${projectId}`);
        if (raw) setProjectData(JSON.parse(raw));
    }, [projectId]);

    const getSelectedLayoutComponent = () => {
        if (selectedLayout === null) return layoutCategories[0].layouts[0]; // Default layout

        const categoryIndex = Math.floor(selectedLayout / 10);
        const layoutIndex = selectedLayout % 10;

        // Ensure valid indices
        if (categoryIndex >= 0 && categoryIndex < layoutCategories.length) {
            const category = layoutCategories[categoryIndex];
            if (layoutIndex >= 0 && layoutIndex < category.layouts.length) {
                return category.layouts[layoutIndex];
            }
        }

        // Fallback to default
        return layoutCategories[0].layouts[0];
    };

    // Get the currently selected layout component
    const SelectedLayoutComponent = getSelectedLayoutComponent();

    if (!projectData) return <p className="p-10">Loading project...</p>;

    return (
        <div>
            <Header isSignedIn={false} />
            <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <section className="py-12 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {projectData.projectName}
                            </h1>
                            <p className="text-gray-700 text-lg mb-4">{projectData.eventDescription}</p>
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

                    <section className="mb-16 mt-6">
                        <h2 className="text-4xl font-bold mb-7">Contribute</h2>
                        <ol className="text-gray-700 list-decimal list-inside mb-6">
                            <li>
                                Click <strong>Add Text</strong> in the layout below to add a memory you have of John.
                            </li>
                            <li>
                                Click <strong>Add a Photo</strong> to add a photo of you and John.
                            </li>
                        </ol>

                        <div id="contributesection" className="border rounded-xl bg-white shadow-md px-6 py-4 w-full max-w-md mx-auto">
                            {/* Render the selected layout component */}
                            <SelectedLayoutComponent
                                signature={signature}
                                setIsModalOpen={setIsModalOpen}
                                message={message}
                                editingMessage={editingMessage}
                                setEditingMessage={setEditingMessage}
                                setMessage={setMessage}
                                uploadedImageUrl={uploadedImageUrl}
                                setShowUploader={setShowUploader}
                            />
                            <div className="mt-4 flex justify-between text-sm text-purple-600 underline">
                                <button onClick={() => setShowLayoutModal(true)} className="text-purple-600 text-sm">
                                    View other layouts
                                </button>
                                <button>Add another page</button>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button className="bg-primary hover:bg-purple-700">Next</Button>
                        </div>
                    </section>
                    <ChatSupportButton title="Chat with Support" />
                </div>
            </div>

            <DashboardModal
                uppy={uppy}
                open={showUploader}
                onRequestClose={() => setShowUploader(false)}
                proudlyDisplayPoweredByUppy={false}
            />
            <LayoutPickerModal
                open={showLayoutModal}
                onClose={() => setShowLayoutModal(false)}
                onSelect={(layoutId: number) => {
                    setSelectedLayout(layoutId);
                    setShowLayoutModal(false);
                }}
                selectedLayout={selectedLayout}
            />
        </div>
    );
}