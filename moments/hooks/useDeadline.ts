import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

export const useDeadline = (projectId: string | undefined) => {
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isDeadlineApproaching, setIsDeadlineApproaching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchDeadline = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(
          `${HTTP_BACKEND}/api/deadline/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { deadline, deadline_enabled } = response.data;
        if (deadline_enabled && deadline) {
          const parsedDeadline = new Date(deadline);
          setDeadlineDate(parsedDeadline);

          // Calculate days left
          const now = new Date();
          const diffTime = parsedDeadline.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays < 0 ? 0 : diffDays);

          // Check if deadline is within 3 days
          setIsDeadlineApproaching(diffDays > 0 && diffDays <= 3);
        }
      } catch (error) {
        console.error('Error fetching deadline:', error);
        setError('Failed to load deadline.');
        toast.error('Failed to load deadline.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeadline();
  }, [projectId, getToken]);

  return { deadlineDate, daysLeft, isDeadlineApproaching, loading, error };
};