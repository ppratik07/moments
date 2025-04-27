'use client';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format } from 'date-fns';
import { HTTP_BACKEND } from '@/utils/config';
import { Header } from '@/components/landing/Header';

export default function DashboardPage() {
    interface Project {
        id: string;
        projectName: string;
        createdAt: string;
    }

    const [projects, setProjects] = useState<Project[]>([]);
    const { isSignedIn } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!isSignedIn) {
            router.push('/'); // Redirect to login if not signed in
            return;
        }
        console.log('Token :', localStorage.getItem('token')); // Check if token is present
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${HTTP_BACKEND}/api/user-projects`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass the token
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();
                setProjects(data.projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, [isSignedIn, router]);

    return (
        <div>
            <Header isSignedIn/>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Projects</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
                        >
                            <div className="w-full h-48 relative">
                                <Image
                                    src={`/api/get-image/${project.id}`} // Ensure this endpoint fetches the image for each project
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
                {projects.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">No projects found.</p>
                )}
            </div>
        </div>

    );
}