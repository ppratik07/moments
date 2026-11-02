'use client';

import { useEffect, useState } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import '@/app/stitch-landing.css';
import { DashboardAppHeader } from '@/components/dashboard/DashboardAppHeader';
import { DashboardProjectCard } from '@/components/dashboard/DashboardProjectCard';
import { BookOpen, Plus, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  projectName: string;
  createdAt: string;
  imageKey?: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { isSignedIn, isLoaded } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace('/');
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setFetchError(null);
      try {
        const token = await getToken();
        if (!token) {
          setFetchError('Could not load your session. Try signing in again.');
          return;
        }
        const response = await fetch(`${HTTP_BACKEND}/api/user-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          setFetchError(
            'Your session could not be verified with the server. If you are running locally, make sure the API is running and Clerk keys match.'
          );
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setFetchError(
          'Could not reach the API. For local development, start the backend in server/ and use http://localhost:8080.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isSignedIn, isLoaded, router, getToken]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${HTTP_BACKEND}/api/user-projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="stitch-landing min-h-screen bg-[var(--color-surface-container-low)]">
      <DashboardAppHeader
        title="Your Projects"
        subtitle="Manage your memory books, invite contributors, and pick up where you left off."
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 pb-16 md:pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <RotatingLines visible strokeColor="#9a4111" strokeWidth="4" width="72" ariaLabel="Loading projects" />
            <p className="font-body-md text-[var(--color-on-surface-variant)]">Loading your keepsakes…</p>
          </div>
        )}

        {!loading && fetchError && (
          <div
            role="alert"
            className="max-w-2xl mx-auto mt-8 flex gap-3 p-5 rounded-xl bg-[var(--color-error-container)]/40 border border-[var(--color-error)]/20 text-[var(--color-on-error-container)]"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-body-md">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && projects.length === 0 && (
          <div className="max-w-lg mx-auto mt-12 md:mt-16 text-center flex flex-col items-center gap-6 p-8 md:p-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/50 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-fixed)] flex items-center justify-center text-[var(--color-primary)]">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-headline-sm text-[var(--color-on-surface)]">No memory books yet</h2>
              <p className="font-body-md text-[var(--color-on-surface-variant)] mt-2">
                Start your first collaborative keepsake and invite friends and family to contribute photos and messages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/new-project')}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-lg px-6 py-3 rounded-lg hover:bg-[var(--color-primary-container)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Book
            </button>
          </div>
        )}

        {!loading && !fetchError && projects.length > 0 && (
          <>
            <p className="font-body-sm text-[var(--color-on-surface-variant)] mb-6 mt-2">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((project) => (
                <DashboardProjectCard
                  key={project.id}
                  id={project.id}
                  projectName={project.projectName}
                  createdAt={project.createdAt}
                  imageKey={project.imageKey}
                  onOpen={() => router.push(`/project/${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
