'use client';

import Sidebar from "@/components/dashboard/SideBar";
import { Header } from "@/components/landing/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useContributions } from "@/hooks/useContribution";
import { useFetchProject } from "@/hooks/useFetchProject";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";


export default function ContributionsPage() {
  const params: Record<string, string | string[]> | null = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { projectName, imageKey, loading: projectLoading, error: projectError } = useFetchProject(projectId);
  const { contributionsData, loading: contributionsLoading, error: contributionsError } = useContributions(projectId);

  const loading = projectLoading || contributionsLoading;
  const error = projectError || contributionsError;

  // State for managing the popup and selected contribution
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Function to open the popup
  const openPopup = (contribution: any) => {
    setSelectedContribution(contribution);
    setCurrentPageIndex(0); // Start at the first page
  };

  // Function to close the popup
  const closePopup = () => {
    setSelectedContribution(null);
    setCurrentPageIndex(0);
  };

  // Functions to navigate through pages
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
              {contributionsData.contributions.map((contribution, contribIndex) => {
                // Find the first photo from the contribution's pages
                let firstPhoto = null;
                for (const page of contribution.pages) {
                  const photo = page.components.find(comp => comp.type === 'photo' && comp.imageUrl);
                  if (photo) {
                    firstPhoto = photo.imageUrl;
                    break;
                  }
                }

                // Find the first paragraph from the contribution's pages
                let firstParagraph = null;
                for (const page of contribution.pages) {
                  const paragraph = page.components.find(comp => comp.type === 'paragraph' && comp.value);
                  if (paragraph) {
                    firstParagraph = paragraph.value;
                    break;
                  }
                }

                return (
                  <div
                    key={contribIndex}
                    className="bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => openPopup(contribution)}
                  >
                    <p className="text-lg font-semibold text-gray-800 mb-3">
                      {contribution.contributorName}
                    </p>

                    {/* Conditional Rendering Based on Photo and Text Availability */}
                    {firstPhoto && !firstParagraph ? (
                      // Only photo, no text
                      <Image
                        src={firstPhoto}
                        alt="Contribution thumbnail"
                        className="w-full h-48 object-cover rounded mb-3"
                        width={400}
                        height={250}
                      />
                    ) : !firstPhoto && firstParagraph ? (
                      // Only text, no photo
                      <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                        {firstParagraph}
                      </p>
                    ) : firstPhoto && firstParagraph ? (
                      // Both photo and text
                      <>
                        <Image
                          src={firstPhoto}
                          alt="Contribution thumbnail"
                          className="w-full h-48 object-cover rounded mb-3"
                          width={400}
                          height={250}
                        />
                        <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                          {firstParagraph}
                        </p>
                      </>
                    ) : (
                      // Neither photo nor text
                      <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center mb-3">
                        <p className="text-gray-500 text-sm">No content available</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No contributions yet.</p>
          )}
        </main>
      </div>

      {/* Popup Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={closePopup}
            >
              ✕
            </button>

            {/* Popup Header */}
            <h2 className="text-2xl font-bold mb-4">{selectedContribution.contributorName}</h2>
            <p className="text-gray-600 mb-4">
              Total Pages: {selectedContribution.pages.length}
            </p>

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
                    const photos = page.components.filter(comp => comp.type === 'photo' && comp.imageUrl);
                    const paragraphs = page.components.filter(comp => comp.type === 'paragraph' && comp.value);

                    // If neither photos nor paragraphs exist, show a fallback
                    if (photos.length === 0 && paragraphs.length === 0) {
                      return (
                        <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-gray-500 text-sm">No content available</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Only render the photo section if photos exist */}
                        {photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {photos.slice(0, 2).map((photo, photoIndex) => (
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

                        {/* Only render the text section if paragraphs exist */}
                        {paragraphs.length > 0 && (
                          paragraphs.map((paragraph, paraIndex) => (
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
                    className={`px-4 py-2 rounded ${
                      currentPageIndex === 0
                        ? 'bg-gray-300'
                        : 'cursor-pointe'
                    }`}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPageIndex === selectedContribution.pages.length - 1}
                    className={`px-4 py-2 rounded ${
                      currentPageIndex === selectedContribution.pages.length - 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'cursor-pointer'
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