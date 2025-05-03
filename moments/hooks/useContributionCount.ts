import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

export const useContributionCount = (projectId: string | undefined) => {
  const [contributionCount, setContributionCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchContributionCount = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(
          `${HTTP_BACKEND}/contributions/count/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setContributionCount(response.data.count);
      } catch (error) {
        console.error('Error fetching contribution count:', error);
        setError('Failed to load contribution count.');
        toast.error('Failed to load contribution count.');
      } finally {
        setLoading(false);
      }
    };

    fetchContributionCount();
  }, [projectId, getToken]);

  return { contributionCount, loading, error };
};