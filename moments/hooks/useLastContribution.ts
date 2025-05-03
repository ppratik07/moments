import { useEffect, useState } from 'react';
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

export const useLastContribution = (projectId: string | undefined) => {
  const [lastContributionDate, setLastContributionDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchLastContribution = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(
          `${HTTP_BACKEND}/api/lastcontribution/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { lastContributionDate } = response.data;
        if (lastContributionDate) {
          setLastContributionDate(new Date(lastContributionDate));
        }
      } catch (error) {
        console.error('Error fetching last contribution:', error);
        setError('Failed to load last contribution.');
      } finally {
        setLoading(false);
      }
    };

    fetchLastContribution();
  }, [projectId, getToken]);

  return { lastContributionDate, loading, error };
};