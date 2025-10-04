'use client';

import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Contribution, useContributions } from "@/hooks/useContribution";
import { useFetchProject } from "@/hooks/useFetchProject";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotatingLines } from "react-loader-spinner";

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

  return (
    <div>
      <Header isSignedIn={true} />
      <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50">
        <Sidebar imageKey={imageKey || ''} projectId={projectId} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold">
          {projectName || (
            <span className="flex items-center gap-2">
              <RotatingLines
                visible={true}
                strokeColor="gray"
                strokeWidth="5"
                animationDuration="0.75"
                width="28"
                ariaLabel="rotating-lines-loading"
              />
            </span>
          )}
        </h1>
        
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-10">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-2 text-center">Total Contributions</h2>
              <p className="text-2xl sm:text-4xl font-bold text-purple-600 text-center">
                {contributionsData ? contributionsData.totalContributions : '—'}
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-2 text-center">Total Pages</h2>
              <p className="text-2xl sm:text-4xl font-bold text-purple-600 text-center">
                {contributionsData
                  ? contributionsData.contributions.reduce((total: number, contrib) => total + contrib.pages.length, 0)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Contributions - Masonry Board */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RotatingLines
                visible={true}
                strokeColor="gray"
                strokeWidth="5"
                animationDuration="0.75"
                width="96"
                ariaLabel="rotating-lines-loading"
              />
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm sm:text-base">{error}</p>
          ) : contributionsData && contributionsData.contributions.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6">
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
                    className="break-inside-avoid mb-4 sm:mb-6 bg-white shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] flex flex-col"
                  >
                    <div className="p-3 sm:p-4">
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
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
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
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
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                            {firstParagraph}
                          </p>
                        </>
                      ) : (
                        // Neither photo nor text
                        <p className="text-gray-500 text-xs sm:text-sm">No content available</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3 sm:p-4 border-t flex justify-between">
                      <button
                        onClick={() => openDetailModal(contribution)}
                        className="text-blue-500 hover:underline text-sm sm:text-base"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">No contributions yet.</p>
          )}
        </main>
      </div>

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-600 hover:text-gray-800 text-lg sm:text-xl"
              onClick={closeDetailModal}
            >
              ✕
            </button>

            {/* Modal Header */}
            <h2 className="text-lg sm:text-2xl font-bold mb-4">{selectedContribution.contributorName}</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Total Pages: {selectedContribution.pages.length}
            </p>

            {/* Current Page */}
            {selectedContribution.pages.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Page {currentPageIndex + 1} of {selectedContribution.pages.length}
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                  {/* Render the current page's content */}
                  {(() => {
                    const page = selectedContribution.pages[currentPageIndex];
                    const photos = page.components.filter((comp) => comp.type === 'photo' && comp.imageUrl);
                    const paragraphs = page.components.filter((comp) => comp.type === 'paragraph' && comp.value);

                    if (photos.length === 0 && paragraphs.length === 0) {
                      return (
                        <div className="w-full h-32 sm:h-40 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-gray-500 text-xs sm:text-sm">No content available</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {photos.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                            {photos.slice(0, 2).map((photo, photoIndex: number) => (
                              <Image
                                key={photoIndex}
                                src={photo.imageUrl!}
                                alt={`Page photo ${photoIndex + 1}`}
                                className="w-full h-auto object-cover rounded-lg"
                                width={150}
                                height={150}
                              />
                            ))}
                            {photos.length === 1 && (
                              <div className="bg-blue-100 rounded-lg flex items-center justify-center h-32 sm:h-48">
                                <p className="text-gray-500 text-xs sm:text-sm">Add a Photo</p>
                              </div>
                            )}
                          </div>
                        )}

                        {paragraphs.length > 0 && (
                          paragraphs.map((paragraph, paraIndex: number) => (
                            <p key={paraIndex} className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
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
                    className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto ${currentPageIndex === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : ''
                      }`}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPageIndex === selectedContribution.pages.length - 1}
                    className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto ${currentPageIndex === selectedContribution.pages.length - 1
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