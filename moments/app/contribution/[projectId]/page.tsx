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

export default function ContributionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signature, setSignature] = useState('Your Name Here');
    const [message, setMessage] = useState('');
    const [showUploader, setShowUploader] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState<number | null>(0); // Default to first layout
    const [editingMessage, setEditingMessage] = useState(false);

    // Track which photo slot is currently being edited
    const [currentPhotoSlot, setCurrentPhotoSlot] = useState<number | null>(null);
    // Store multiple image URLs instead of just one
    const [uploadedImageUrls, setUploadedImageUrls] = useState<(string | null)[]>([null, null]);
    const [activeSlot, setActiveSlot] = useState<number>(0);

    const { projectId } = useParams();

    interface ProjectData {
        projectName: string;
        eventDescription: string;
        imageKey?: string;
    }

    const [uppy, setUppy] = useState(() =>
        new Uppy({
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
        })
    );

    useEffect(() => {
        uppy.on('complete', (result) => {
            const url = result.successful?.[0]?.uploadURL ?? null;
            console.log('Uppy complete, url:', url, 'uppy files:', uppy.getFiles());
            if (url) {
                setUploadedImageUrls((prev) => {
                    const newUrls = [...prev];
                    newUrls[activeSlot] = url;
                    return newUrls;
                });
            }
            setShowUploader(false);
            // Create a new uppy instance
            setUppy(
                new Uppy({
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
                })
            );
        });
    
        uppy.on('error', (error) => {
            console.error('Uppy error:', error);
        });
    
        return () => uppy.destroy();
    }, [uppy, activeSlot]);

    useEffect(() => {
        console.log('activeSlot updated to:', activeSlot);
    }, [activeSlot]);

    useEffect(() => {
        console.log('showUploader updated to:', showUploader);
    }, [showUploader]);

    const [projectData, setProjectData] = useState<ProjectData | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem(`project-${projectId}`);
        if (raw) setProjectData(JSON.parse(raw));
    }, [projectId]);


    // Message Editor Component
    const MessageEditor = () => (
        <div className="w-full">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add your message here..."
                className="w-full p-3 border border-gray-300 rounded-md min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="flex justify-end mt-2 space-x-2">
                <button
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setEditingMessage(false)}
                >
                    Cancel
                </button>
                <button
                    className="px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    onClick={() => setEditingMessage(false)}
                >
                    Save
                </button>
            </div>
        </div>
    );

    // Define layout categories and their associated rendering functions
    const layoutCategories = [
        {
            title: 'Message Only',
            layouts: [
                // Text only layout
                () => (
                    <>
                        <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p>{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ),
                // Another message layout variation (could be different text formatting)
                () => (
                    <>
                        <div className="text-lg italic font-medium text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="bg-gray-50 border-l-4 border-purple-400 pl-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p className="italic">{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">
                                        <div className="text-lg mb-1 inline-block">⊕</div> ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )
            ],
        },
        {
            title: 'Photos Only',
            layouts: [
                // Two photos side by side
                () => (
                    <div className="grid grid-cols-2 gap-2">
                        {[...Array(2)].map((_, i) => (
                            <div
                                id={i.toString()}
                                key={i}
                                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                                onClick={() => {
                                    console.log('Clicked photo slot:', i, 'active slot:', activeSlot, 'showUploader:', showUploader);
                                    setActiveSlot(i);
                                    setShowUploader(true);
                                }}
                            >
                                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                                <div className="relative z-10 text-center">
                                    {uploadedImageUrls[i] ? (
                                        <Image
                                            src={uploadedImageUrls[i]!}
                                            alt="Uploaded"
                                            className="w-full h-full object-cover"
                                            width={500}
                                            height={300}
                                        />
                                    ) : (
                                        <>
                                            <div className="text-lg mb-1">⊕</div>
                                            ADD A PHOTO
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ),
                // One photo on top of another
                () => (
                    <div className="grid grid-rows-2 gap-2">
                        {[...Array(2)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                                onClick={() => {
                                    setActiveSlot(i + 2); // Use different indices for this layout
                                    setShowUploader(true);
                                }}
                            >
                                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                                <div className="relative z-10 text-center">
                                    {uploadedImageUrls[i + 2] ? (
                                        <Image src={uploadedImageUrls[i + 2] ?? ''} alt="Uploaded" className="w-full h-full object-cover" width={500} height={300} />
                                    ) : (
                                        <>
                                            <div className="text-lg mb-1">⊕</div>
                                            ADD A PHOTO
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ),
                // Three photo layout (2 top, 1 bottom)
                () => (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
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
                            ))}
                        </div>
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
                    </div>
                ),
                // Three photo layout (1 top, 2 bottom)
                () => (
                    <div className="space-y-2">
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
                        <div className="grid grid-cols-2 gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
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
                            ))}
                        </div>
                    </div>
                ),
                // Four photo layout (2x2 grid)
                () => (
                    <div className="grid grid-rows-2 gap-2">
                        {[...Array(2)].map((_, row) => (
                            <div key={row} className="grid grid-cols-2 gap-2">
                                {[...Array(2)].map((_, col) => (
                                    <div
                                        key={`${row}-${col}`}
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
                                ))}
                            </div>
                        ))}
                    </div>
                )
            ],
        },
        {
            title: 'Message with Photos',
            layouts: [
                // Message on top, photo below
                () => (
                    <>
                        <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p>{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
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
                    </>
                ),
                // Photo on top, message below
                () => (
                    <>
                        <div
                            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer mb-4"
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
                        <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p>{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ),
                // Two photos on top, message below
                () => (
                    <>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
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
                            ))}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p>{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ),
                // Message on top, two photos below
                () => (
                    <>
                        <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {signature}
                            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                        </div>
                        {editingMessage ? (
                            <MessageEditor />
                        ) : (
                            <div
                                className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingMessage(true)}
                            >
                                {message ? (
                                    <div className="text-gray-800">
                                        <p>{message}</p>
                                        <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-1">⊕</div>
                                        ADD TEXT
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
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
                            ))}
                        </div>
                    </>
                ),
                // Message with photo to the side
                () => (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                {signature}
                                <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>✎</button>
                            </div>
                            {editingMessage ? (
                                <MessageEditor />
                            ) : (
                                <div
                                    className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => setEditingMessage(true)}
                                >
                                    {message ? (
                                        <div className="text-gray-800">
                                            <p>{message}</p>
                                            <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <div className="text-lg mb-1">⊕</div>
                                            ADD TEXT
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
                    </div>
                ),
            ],
        },
    ];



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

                        <div id='contributesection' className="border rounded-xl bg-white shadow-md px-6 py-4 w-full max-w-md mx-auto">
                            {/* Render the selected layout component */}
                            {SelectedLayoutComponent()}
                            <div className="mt-4 flex justify-between text-sm text-purple-600 underline">
                                <button onClick={() => setShowLayoutModal(true)} className="text-purple-600 underline text-sm">
                                    View other layouts
                                </button>
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

            <DashboardModal
                uppy={uppy}
                open={showUploader}
                onRequestClose={() => {
                    console.log('Closing uploader, showUploader:', showUploader);
                    setShowUploader(false);
                }}
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