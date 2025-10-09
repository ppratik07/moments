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
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthWrapper } from '@/components/AuthWrapper';

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    const fetchProjects = async () => {
      // Don't fetch if auth is not loaded yet
      if (!isLoaded) {
        return;
      }

      try {
        setError(null); // Clear any previous errors
        const token = await getToken();
        
        if (!token) {
          console.log('No token available yet, waiting for auth...');
          // Don't sign out immediately - auth might still be loading
          setLoading(false);
          return;
        }

        const response = await fetch(`${HTTP_BACKEND}/api/user-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Only sign out if explicitly unauthorized (not network errors)
        if (response.status === 401) {
          console.log('Unauthorized - invalid token, signing out');
          await signOut({ redirectUrl: '/sign-in' });
          return;
        }

        // For other errors, show error message but keep user logged in
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch projects:', response.status, errorText);
          setError('Unable to load projects. Please try again later.');
          setProjects([]); // Clear projects on error
          return;
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Don't sign out on network errors - keep user logged in
        setError('Network error. Please check your connection and try again.');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isSignedIn, router, getToken, signOut, isLoaded]);

  // Function to handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    // Show confirmation prompt
    if (!confirm(`Are you sure you want to delete the project? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${HTTP_BACKEND}/api/user-projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove the deleted project from state
      setProjects(projects.filter((project) => project.id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const baseImageUrl =
    process.env.NEXT_PUBLIC_IMAGE_R2_URL || '';

  return (
    <AuthWrapper requireAuth={true}>
      <div>
        <Header isSignedIn={isSignedIn ?? false} />
        <div className="min-h-screen bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Projects</h1>
          
          {/* Error Message Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

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
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        isClosed ? 'bg-red-600' : 'bg-green-500'
                      } text-white`}
                    >
                      {tagLabel}
                    </span>
                  </div>

                  {/* Delete icon */}
                  <div className="absolute top-3 left-3 z-20">
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none"
                      aria-label="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Overlay content */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 text-white">
                    <h2 className="text-lg font-semibold mb-1">{project.projectName}</h2>
                    <p className="text-sm mb-3">
                      Created on: {format(createdDate, 'MMMM dd, yyyy')}
                    </p>
                    <Button
                      className={`w-full ${isClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
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
    </AuthWrapper>
  );
}
