import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

interface Project {
  projectName: string;
  imageKey: string | null;
}

interface FetchProjectResult {
  projectName: string | null;
  imageKey: string | null;
  loading: boolean;
  error: string | null;
}

export const useFetchProject = (projectId: string | undefined): FetchProjectResult => {
  const [projectName, setProjectName] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(`${HTTP_BACKEND}/api/user-projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const project: Project = response.data.project;
        if (!project) {
          throw new Error('Project not found');
        }

        setProjectName(project.projectName);
        setImageKey(project.imageKey || null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
        toast.error('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, getToken]);

  return { projectName, imageKey, loading, error };
};