
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { Header } from '@/components/landing/Header';
import { getImageUrl } from '@/helpers/getImageUrl';

export default function NewEventPage() {
    const [showModal, setShowModal] = useState(true);
    const [copied, setCopied] = useState(false);
    const shareLink = 'http://momentsmemorybooks.com/34534';
    const params = useParams();
    const { imageKey } = useProjectStore();
    const projectName = useProjectStore.getState().projectName || params.project_name;
    const decodedProjectName = typeof projectName === 'string' ? projectName.replace(/%20/g, " ") : '';
    const [showEditModal, setShowEditModal] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-bold">N</div>
                    <span className="font-semibold">Invite Your Friends</span>
                </div>

                {/* Center Section */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <input
                        type="text"
                        value="http://momentsmemory..."
                        readOnly
                        className="bg-white text-black px-4 py-2 rounded"
                    />
                    <Button className="bg-primary text-white px-4 py-2 rounded">Copy Link</Button>
                </div>

                {/* Right Section */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <Button className="bg-primary text-white px-4 py-2 rounded">Dashboard</Button>
                    <Button className="bg-primary text-white px-4 py-2 rounded" onClick={() => setShowEditModal(true)}>Edit this Page</Button>
                </div>
            </div>

            <Header isSignedIn={false} />

            <main className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* Left - Text */}
                    <div>
                        <h1 className="text-4xl font-bold mb-10">{decodedProjectName}</h1>
                        <p className="text-lg text-gray-700 mb-4">
                            Let’s celebrate John’s special day with love, laughter, and warm wishes. Birthdays are
                            for cherishing memories and creating new ones that last forever!
                        </p>
                        <p className="text-md text-gray-600 mb-6">
                            Gather with friends and family to share heartfelt messages and joyful moments. Every
                            smile and wish makes this day even more special.
                        </p>
                        <p className="text-md text-gray-600 mb-6">
                            Let’s make this birthday unforgettable with happiness, surprises, and the company of
                            loved ones. Here’s to a fantastic year ahead for John!
                        </p>
                        <Button variant="outline">How it Works</Button>
                    </div>

                    {/* Right - Image */}
                    {imageKey && (
                        <Image
                            src={getImageUrl(imageKey) || ''}
                            alt="Celebration"
                            width={600}
                            height={400}
                            className="shadow-md"
                        />
                    )}
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-4">Contribute</h2>
                    <p className="text-md text-gray-600 mb-6">
                        Add a memory, well wish, or photo. Want to add more photos? Simply click below.
                    </p>
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 italic">Upload photo or memory form here</p>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-xs bg-white/5 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h3 className="text-lg font-semibold mb-2">🎉 Project Created!</h3>
                        <p className="text-sm mb-2">
                            Your project has been created and this is the landing page for your project! This is
                            where your friends will contribute to the book.
                        </p>
                        <p className="text-sm mb-2 font-medium">✏️ Edit this Page</p>
                        <p className="text-xs mb-2">
                            You can edit parts of this page by clicking “Edit this Page” at the top.
                        </p>
                        <p className="text-sm font-medium">📨 Invite Friends!</p>
                        <p className="text-xs">
                            When you are ready, copy the sharing link above to invite your friends to contribute.
                        </p>
                        <div className="text-right mt-4">
                            <Button size="sm" onClick={() => setShowModal(false)}>
                                Got it
                            </Button>
                        </div>
                    </div>
                </div>

            )}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
                        <h2 className="text-xl font-bold mb-4">✏️ Edit Landing Page</h2>

                        <label className="block font-semibold mb-2">Project Photo</label>
                        <div className="mb-4 relative">
                            <Image
                                src={getImageUrl(imageKey) || ''}
                                alt="Project"
                                className="rounded-md"
                            />
                            <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l4 4L20.485 7.515a2.121 2.121 0 00-3-3L10 12z" />
                                </svg>
                            </button>
                        </div>

                        <label className="block font-semibold mb-1">Project Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mb-4"
                            defaultValue={decodedProjectName}
                        />

                        <label className="block font-semibold mb-1">Project Description</label>
                        <textarea
                            rows={6}
                            className="w-full p-2 border rounded mb-4"
                            placeholder="Write something..."
                            defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi..."
                        />

                        {/* Buttons */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                className="text-sm text-blue-600 underline"
                                onClick={() => {/* reset logic here if needed */ }}
                            >
                                Reset to Default
                            </button>
                            <div className="space-x-2">
                                <Button
                                    className="px-4 py-2 bg-gray-200 rounded"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                    onClick={() => {
                                        // save logic here
                                        setShowEditModal(false);
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

}
