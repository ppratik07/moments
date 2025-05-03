import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

interface OrderSummary {
  orderId: string;
  orderDate: string;
  total: number;
}

interface ProjectStatus {
  status: 'gathering' | 'reviewing' | 'printing';
  orderSummary?: OrderSummary;
}

export const useProjectStatus = (projectId: string | undefined) => {
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectStatus = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        // Fetch project status
        const statusResponse = await axios.get(
          `${HTTP_BACKEND}/api/project-status/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const status = statusResponse.data.status;

        // Fetch order summary if in printing state
        let orderSummary: OrderSummary | undefined;
        if (status === 'printing') {
          const orderResponse = await axios.get(
            `${HTTP_BACKEND}/api/orders/${projectId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          orderSummary = orderResponse.data;
        }

        setProjectStatus({ status, orderSummary });
      } catch (error) {
        console.error('Error fetching project status:', error);
        setError('Failed to load project status.');
        toast.error('Failed to load project status.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStatus();
  }, [projectId, getToken]);

  return { projectStatus, loading, error };
};