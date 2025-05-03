import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

interface Project {
  id: string;
  name: string;
}

export const useUserProjects = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(`${HTTP_BACKEND}/api/user-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching user projects:', error);
        setError('Failed to load projects.');
        toast.error('Error fetching projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken]);

  return { projects, loading, error };
};