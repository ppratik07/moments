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
    }

    const [projects, setProjects] = useState<Project[]>([]);
    const { isSignedIn } = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    useEffect(() => {
        if (!isSignedIn) {
            router.push('/'); // Redirect to login if not signed in
            return;
        }
        const fetchProjects = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.log('No token found, redirecting...');
                    await signOut({ redirectUrl: '/' });
                    return;
                }
                const response = await fetch(`${HTTP_BACKEND}/api/user-projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    console.log('Unauthorized or token expired. Signing out...');
                    await signOut({ redirectUrl: '/' });
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();
                setProjects(data.projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
                await signOut({ redirectUrl: '/' });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [isSignedIn, router, getToken]);

    return (
        <div>
            <Header isSignedIn />
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
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
                            >
                                <div className="w-full h-48 relative">
                                    <Image
                                        src={`/api/get-image/${project.id}`}
                                        alt={project.projectName}
                                        fill
                                        className="object-cover rounded-t-lg"
                                    />
                                </div>
                                <div className="p-4 text-center flex-grow">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.projectName}</h2>
                                    <p className="text-sm text-gray-600">
                                        Created on: {format(new Date(project.createdAt), 'MMMM dd, yyyy')}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200"
                                        onClick={() => router.push(`/project/${project.id}`)}
                                    >
                                        View Project
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">No projects found.</p>
                )}
            </div>
        </div>

    );
}