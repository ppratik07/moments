import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { HTTP_BACKEND } from "@/utils/config";
import { useAuth } from "@clerk/nextjs";

interface ContributionSummary {
  id: string;
  contributorName: string;
  message: string | null;
  photo: string | null;
}

interface ContributionsResponse {
  contributions: ContributionSummary[];
  totalContributions: number;
}

export const useContributions = (projectId: string | undefined) => {
  const [contributionsData, setContributionsData] = useState<ContributionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!projectId) return;

    const fetchContributions = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("No token available");

        const response = await axios.get(`${HTTP_BACKEND}/api/contributions/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setContributionsData(response.data);
      } catch (error) {
        console.error("Error fetching contributions:", error);
        setError("Failed to load contributions.");
        toast.error("Failed to load contributions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [projectId, getToken]);

  return { contributionsData, loading, error };
};
