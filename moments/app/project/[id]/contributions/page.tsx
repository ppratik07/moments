'use client';

import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useContributions } from "@/hooks/useContribution";
import { useFetchProject } from "@/hooks/useFetchProject";

export default function ContributionsPage() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { projectName, imageKey, loading: projectLoading, error: projectError } = useFetchProject(projectId);
  const { contributionsData, loading: contributionsLoading, error: contributionsError } = useContributions(projectId);

  const loading = projectLoading || contributionsLoading;
  const error = projectError || contributionsError;

  return (
    <div>
      <Header isSignedIn={true} />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar imageKey={imageKey || ''} projectId={projectId} />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{projectName || 'Loading...'}</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Contributions</h2>
              <p className="text-4xl font-bold text-purple-600">
                {contributionsData ? contributionsData.totalContributions : '—'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Pages</h2>
              <p className="text-4xl font-bold text-purple-600">
                {contributionsData
                  ? contributionsData.contributions.reduce((total, contrib) => total + contrib.pages.length, 0)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Contributions */}
          {loading ? (
            <p className="text-gray-600">Loading contributions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : contributionsData && contributionsData.contributions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {contributionsData.contributions.flatMap((contribution) =>
                contribution.pages.map((page, pageIndex) => (
                  <div
                    key={`${contribution.id}-${pageIndex}`}
                    className="bg-white rounded-lg shadow p-4 flex flex-col"
                  >
                    <p className="text-lg font-semibold text-gray-800 mb-3">
                      {contribution.contributorName}
                    </p>

                    {page.components.length > 0 ? (
                      page.components.map((component, compIndex) => {
                        if (component.type === 'photo' && component.imageUrl) {
                          return (
                            <Image
                              key={compIndex}
                              src={component.imageUrl}
                              alt="Contribution photo"
                              className="w-full h-auto object-cover rounded mb-3"
                              width={400}
                              height={250}
                            />
                          );
                        }
                        if (component.type === 'paragraph' && component.value) {
                          return (
                            <p key={compIndex} className="text-gray-600 text-sm mb-2">
                              {component.value}
                            </p>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500 text-sm">No content available</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          ) : (
            <p className="text-gray-600">No contributions yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
