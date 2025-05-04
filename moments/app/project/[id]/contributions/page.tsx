'use client'
import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
//import { useProjectStore } from "@/store/useProjectStore";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useContributions } from "@/hooks/useContribution";
import axios from "axios";
import { HTTP_BACKEND } from "@/utils/config";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ContributionsPage() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  //const { imageKey, projectName } = useProjectStore();
  const { contributionsData, loading, error } = useContributions(projectId);
  const [projectNames, setProjectNames] = useState<string | null>(null);
  const [imageKeys, setImageKeys] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [, setErrors] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setErrors('Invalid project ID');
        return;
      }

      try {
        const token = await getToken();
        if (!token) throw new Error('No token available');

        const response = await axios.get(`${HTTP_BACKEND}/api/user-projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const project = response.data.project;
        if (!project) {
          throw new Error('Project not found');
        }

        setProjectNames(project.projectName);
        setImageKeys(project.imageKey || null);
        console.log('projectkey', project.imageKey);
      } catch (errors) {
        console.error('Error fetching project:', errors);
        setErrors('Failed to load project details');
        toast.error('Error fetching project details');
      } 
    };

    fetchProject();
  }, [projectId, getToken]);
  return (
    <div>
      <Header isSignedIn={true} />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar imageKey={imageKeys || ''} />
        <main className="flex-1 p-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{projectNames}</h1>
          </div>

          {/* Stats Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Contributions</h2>
              <p className="text-4xl font-bold text-purple-600">
                {contributionsData ? contributionsData.totalContributions : '—'}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Pages</h2>
              <p className="text-4xl font-bold text-purple-600">100</p>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading contributions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : contributionsData && contributionsData.contributions.length > 0 ? (
            <div className="columns-1 md:columns-3 lg:columns-4 gap-6">
              {contributionsData.contributions.map(contribution => (
                <div key={contribution.id} className="break-inside-avoid mb-6 bg-white rounded-lg shadow-md p-4">
                  {contribution.photo ? (
                    <Image
                      src={contribution.photo}
                      alt={`Contribution from ${contribution.contributorName}`}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                      <p className="text-gray-500 text-sm">No photo available</p>
                    </div>
                  )}
                  {contribution.message ? (
                    <p className="text-gray-700 text-sm mb-2">{contribution.message}</p>
                  ) : (
                    !contribution.photo && (
                      <p className="text-gray-700 text-sm mb-2">No message provided.</p>
                    )
                  )}
                  <p className="text-gray-500 text-sm font-semibold">{contribution.contributorName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No contributions yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}