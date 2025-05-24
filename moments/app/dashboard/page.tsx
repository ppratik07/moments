'use client';
import { useEffect, useState } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format } from 'date-fns';
import { HTTP_BACKEND } from '@/utils/config';
import { Header } from '@/components/landing/Header';
import { useAuth, useClerk } from '@clerk/nextjs';

export default function DashboardPage() {
    interface Project {
        id: string;
        projectName: string;
        createdAt: string;
        imageKey?: string;
    }

    const [projects, setProjects] = useState<Project[]>([]);
    const { isSignedIn } = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    useEffect(() => {
        // if (!isSignedIn) {
        //     console.log('Not signed in, redirecting...');
        //     router.push('/');
        //     localStorage.removeItem('token')
        //     return;
        // }
        const fetchProjects = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.log('No token found, redirecting...');
                    // await signOut({ redirectUrl: '/' });
                    // return;
                }
                const response = await fetch(`${HTTP_BACKEND}/api/user-projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    console.log('Unauthorized or token expired. Signing out...');
                    localStorage.removeItem('token');
                    await signOut({ redirectUrl: '/' });
                    return;
                }
                if (!response.ok) {
                    console.log('Failed to fetch projects');
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();
                console.log('Fetched projects:', data.projects);
                setProjects(data.projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
                localStorage.removeItem('token');
                await signOut({ redirectUrl: '/' });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [isSignedIn, router, getToken, signOut]);

    const baseImageUrl = process.env.NEXT_PUBLIC_IMAGE_R2_URL || 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
    return (
        <div>
            <Header isSignedIn={isSignedIn ?? false}  />
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Projects</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <RotatingLines
                            visible={true}
                            strokeColor="gray"
                            strokeWidth="5"
                            animationDuration="0.75"
                            width="96"
                            ariaLabel="rotating-lines-loading"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const createdDate = new Date(project.createdAt);
                            const isClosed = new Date().getTime() - createdDate.getTime() > 365 * 24 * 60 * 60 * 1000;
                            const tagLabel = isClosed ? 'Closed' : 'New';

                            return (
                                <div
                                    key={project.id}
                                    className="relative w-full max-h-[420px] h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Background image */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={project.imageKey ? `${baseImageUrl}/${project.imageKey}` : '/fallback.jpg'}
                                            alt={project.projectName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-black/40" />

                                    {/* Tag badge */}
                                    <div className="absolute top-3 right-3 z-20">
                                        <span
                                            className={`text-xs font-semibold px-2 py-1 rounded ${isClosed ? 'bg-red-600' : 'bg-green-500'
                                                } text-white`}
                                        >
                                            {tagLabel}
                                        </span>
                                    </div>

                                    {/* Overlay content */}
                                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 text-white">
                                        <h2 className="text-lg font-semibold mb-1">{project.projectName}</h2>
                                        <p className="text-sm mb-3">
                                            Created on: {format(createdDate, 'MMMM dd, yyyy')}
                                        </p>
                                        <Button
                                            className={`w-full ${isClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                            onClick={() => {
                                                if (!isClosed) {
                                                    router.push(`/project/${project.id}`);
                                                }
                                            }}
                                            disabled={isClosed}
                                        >
                                            View Project
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">No projects found.</p>
                )}
            </div>
        </div>

    );
}