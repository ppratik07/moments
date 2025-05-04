'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

interface ComponentData {
  type: string;
  imageUrl?: string | null;
  value?: string | null;
}

interface PageData {
  components: ComponentData[];
}

interface Contribution {
  id: string;
  signature: string;
  pages: PageData[];
  contributorName: string;
  createdAt: string;
}

interface ContributionsData {
  totalContributions: number;
  contributions: Contribution[];
}

interface ContributionsResult {
  contributionsData: ContributionsData | null;
  loading: boolean;
  error: string | null;
}

export const useContributions = (projectId: string | undefined): ContributionsResult => {
  const [contributionsData, setContributionsData] = useState<ContributionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchContributions = async () => {
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

        const response = await axios.get(`${HTTP_BACKEND}/api/contributions/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (!data || !data.contributions) {
          throw new Error('Contributions not found');
        }

        setContributionsData({
          totalContributions: data.totalContributions,
          contributions: data.contributions.map((contrib: any) => ({
            id: contrib.id,
            signature: contrib.signature,
            contributorName: contrib.signature, // Assuming signature is the contributor's name
            createdAt: contrib.createdAt,
            pages: contrib.pages.map((page: any) => ({
              components: page.components.map((comp: any) => ({
                type: comp.type,
                imageUrl: comp.imageUrl || null,
                value: comp.value || null,
              })),
            })),
          })),
        });
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError('Failed to load contributions');
        toast.error('Error fetching contributions');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [projectId, getToken]);

  return { contributionsData, loading, error };
};