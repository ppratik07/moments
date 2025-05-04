'use client';

import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Contribution, useContributions } from "@/hooks/useContribution";
import { useFetchProject } from "@/hooks/useFetchProject";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContributionsPage() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { projectName, imageKey, loading: projectLoading, error: projectError } = useFetchProject(projectId);
  const { contributionsData, loading: contributionsLoading, error: contributionsError } = useContributions(projectId);

  const loading = projectLoading || contributionsLoading;
  const error = projectError || contributionsError;

  // State for the detail modal
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Function to open the detail modal
  const openDetailModal = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setCurrentPageIndex(0);
  };

  // Function to close the detail modal
  const closeDetailModal = () => {
    setSelectedContribution(null);
    setCurrentPageIndex(0);
  };

  // Function to navigate through pages in the detail modal
  const goToPreviousPage = () => {
    if (selectedContribution && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (selectedContribution && currentPageIndex < selectedContribution.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  // // Function to update exclusion setting (simulated database call)
  // const updateExclusionSetting = async (contributionId: string, excluded: boolean) => {
  //   try {
  //     // Simulate API call to update the excludedFromBook field
  //     console.log(`Updating exclusion for contribution ${contributionId}: excluded=${excluded}`);
  //     // Update local state (in a real app, this would be handled by re-fetching or updating the state via a mutation)
  //     const updatedContributions = contributionsData?.contributions.map((contrib: any) =>
  //       contrib.id === contributionId ? { ...contrib, excludedFromBook: excluded } : contrib
  //     );
  //     // Note: In a real app, you would update the database and refresh the data
  //     console.log('Updated contributions:', updatedContributions);
  //   } catch (error) {
  //     console.error('Error updating exclusion setting:', error);
  //   }
  // };

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
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2 text-center">Total Contributions</h2>
              <p className="text-4xl font-bold text-purple-600 text-center">
                {contributionsData ? contributionsData.totalContributions : '—'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2 text-center">Total Pages</h2>
              <p className="text-4xl font-bold text-purple-600 text-center">
                {contributionsData
                  ? contributionsData.contributions.reduce((total: number, contrib) => total + contrib.pages.length, 0)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Contributions - Masonry Board */}
          {loading ? (
            <p className="text-gray-600">Loading contributions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : contributionsData && contributionsData.contributions.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
              {contributionsData.contributions.map((contribution: Contribution, contribIndex: number) => {
                // Find the first photo from the contribution's pages
                let firstPhoto = null;
                for (const page of contribution.pages) {
                  const photo = page.components.find((comp) => comp.type === 'photo' && comp.imageUrl);
                  if (photo) {
                    firstPhoto = photo.imageUrl;
                    break;
                  }
                }

                // Find the first paragraph from the contribution's pages
                let firstParagraph = null;
                for (const page of contribution.pages) {
                  const paragraph = page.components.find((comp) => comp.type === 'paragraph' && comp.value);
                  if (paragraph) {
                    firstParagraph = paragraph.value;
                    break;
                  }
                }

                return (
                  <div
                    key={contribIndex}
                    className="break-inside-avoid mb-6 bg-white rounded-2xl shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] flex flex-col"
                  >
                    <div className="p-4">
                      <p className="text-lg font-semibold text-gray-800 mb-3">
                        {contribution.contributorName}
                      </p>

                      {/* Conditional Rendering Based on Photo and Text Availability */}
                      {firstPhoto && !firstParagraph ? (
                        // Only photo, no text
                        <Image
                          src={firstPhoto}
                          alt="Contribution thumbnail"
                          className="w-full h-auto object-cover rounded mb-3"
                          width={400}
                          height={250}
                        />
                      ) : !firstPhoto && firstParagraph ? (
                        // Only text, no photo
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {firstParagraph}
                        </p>
                      ) : firstPhoto && firstParagraph ? (
                        // Both photo and text
                        <>
                          <Image
                            src={firstPhoto}
                            alt="Contribution thumbnail"
                            className="w-full h-auto object-cover rounded mb-3"
                            width={400}
                            height={250}
                          />
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {firstParagraph}
                          </p>
                        </>
                      ) : (
                        // Neither photo nor text
                        <p className="text-gray-500 text-sm">No content available</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 border-t flex justify-between">
                      <button
                        onClick={() => openDetailModal(contribution)}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No contributions yet.</p>
          )}
        </main>
      </div>

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={closeDetailModal}
            >
              ✕
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold mb-4">{selectedContribution.contributorName}</h2>
            <p className="text-gray-600 mb-4">
              Total Pages: {selectedContribution.pages.length}
            </p>

            {/* Exclusion Toggle
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedContribution.excludedFromBook || false}
                  onChange={(e) => updateExclusionSetting(selectedContribution.id, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-600">Exclude from Book</span>
              </label>
            </div> */}

            {/* Current Page */}
            {selectedContribution.pages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Page {currentPageIndex + 1} of {selectedContribution.pages.length}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {/* Render the current page's content */}
                  {(() => {
                    const page = selectedContribution.pages[currentPageIndex];
                    const photos = page.components.filter((comp) => comp.type === 'photo' && comp.imageUrl);
                    const paragraphs = page.components.filter((comp) => comp.type === 'paragraph' && comp.value);

                    if (photos.length === 0 && paragraphs.length === 0) {
                      return (
                        <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-gray-500 text-sm">No content available</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {photos.slice(0, 2).map((photo, photoIndex: number) => (
                              <Image
                                key={photoIndex}
                                src={photo.imageUrl!}
                                alt={`Page photo ${photoIndex + 1}`}
                                className="w-full h-auto object-cover rounded-lg"
                                width={200}
                                height={200}
                              />
                            ))}
                            {photos.length === 1 && (
                              <div className="bg-blue-100 rounded-lg flex items-center justify-center h-48">
                                <p className="text-gray-500 text-sm">Add a Photo</p>
                              </div>
                            )}
                          </div>
                        )}

                        {paragraphs.length > 0 && (
                          paragraphs.map((paragraph, paraIndex: number) => (
                            <p key={paraIndex} className="text-gray-600 text-base leading-relaxed mb-4">
                              {paragraph.value}
                            </p>
                          ))
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Slider Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPageIndex === 0}
                    className={`px-4 py-2 rounded ${currentPageIndex === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : ''
                      }`}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPageIndex === selectedContribution.pages.length - 1}
                    className={`px-4 py-2 rounded ${currentPageIndex === selectedContribution.pages.length - 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'text-white cursor-pointer'
                      }`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}