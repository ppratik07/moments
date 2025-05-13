'use client';

// import { PageLayout } from "@/components/contribution/PageLayout";
import { PageNavigation } from "@/components/contribution/PageNavigation";
import { Page, ProjectData, SignatureEditModal } from "@/components/contribution/SignatureEditModal";
import StepIndicator from "@/components/contribution/StepIndicator";
import TipsBox from "@/components/contribution/TipsBox";
import { Header } from "@/components/landing/Header";
import LayoutPickerModal from "@/components/LayoutPickerModel";
import { getImageUrl } from "@/helpers/getImageUrl";
import Footer from "@/pages/Footer";
import { HTTP_BACKEND } from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutEditorPage from '@/components/LayoutEditorPage';
import { availableLayouts } from "@/components/contribute/availableLayouts";
import { layoutCategories } from "@/components/contribute/layoutCategories";
//fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4
// Type definitions (unchanged)
interface Position {
  x_position?: number;
  y_position?: number;
  x_coordinate?: number;
  y_coordinate?: number;
}

interface Size {
  width: number;
  height: number;
}

interface Styles {
  font_family?: string;
  font_size?: number;
  font_weight?: string;
}

interface Editor {
  label: string;
  placeholder: string;
  max_characters: number;
}

interface CroppingInfo {
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}

interface Original {
  url: string;
  cropping_info: CroppingInfo;
}

interface Component {
  type: 'heading' | 'signature' | 'paragraph' | 'caption' | 'photo';
  position: Position;
  size: Size;
  styles?: Styles;
  editor?: Editor;
  value?: string;
  image_url?: string;
  original?: Original;
}

export interface Layout {
  guid: string;
  name?: string;
  components: Component[];
}

interface ExtendedPage extends Page {
  guid?: string;
  components?: Component[];
}


export default function ContributionPage() {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState('Your Name Here');
  const [pages, setPages] = useState<ExtendedPage[]>([
    { layout: 0, images: [null, null, null, null], message: '', components: availableLayouts[0].components },
  ]);
  const [activePage, setActivePage] = useState(0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { projectId } = useParams() as { projectId: string };
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const handleNextClick = async () => {
    setUploading(true);
    setError(null);
  
    try {
      const contributionData = {
        projectId,
        signature,
        pages: pages.map((page) => ({
          guid: page.guid || `page-${Math.random().toString(36).substr(2, 9)}`,
          layoutId: page.layout >= 0 ? page.layout : 0, // Ensure layoutId is non-negative, default to 0 if invalid
          images: page.images.filter((image): image is string => image !== null), // Filter out null values
          message: page.components?.find((comp) => comp.type === 'paragraph')?.value || '',
          components: (page.components ?? []).map((component) => ({
            type: component.type,
            position: component.position || null,
            size: component.size,
            styles: component.styles || null,
            editor: component.editor || null,
            value: component.value,
            image_url: component.image_url,
            original: component.original || null,
          })),
        })),
      };
  
      const response = await axios.post(`${HTTP_BACKEND}/api/save-contribution`, contributionData);
  
      if (response.status !== 200) {
        throw new Error('Failed to save contribution');
      }
  
      router.push(`/contribution/${projectId}/fill-information`);
    } catch (error) {
      console.error('Error saving contribution:', error);
      setError('Failed to save your contribution. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(`project-${projectId}`);
    if (raw) setProjectData(JSON.parse(raw));
  }, [projectId]);

  const extractKeyFromUrl = (url: string): string => {
    const prefix = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane/';
    return url.replace(prefix, '');
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    pageIndex: number,
    slotIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `${HTTP_BACKEND}/api/get-presign-url?fileType=${encodeURIComponent(file.type)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch presigned URL: ${response.statusText}`);
      }
      const { uploadUrl, key } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image to R2: ${uploadResponse.statusText}`);
      }

      const imageUrl = `https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane/${key}`;

      setPages((prev) => {
        const newPages = [...prev];
        const updatedComponents = newPages[pageIndex].components?.map((comp, compIndex) =>
          comp.type === 'photo' && compIndex === slotIndex
            ? { ...comp, image_url: imageUrl, original: { url: imageUrl, cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } } }
            : comp
        ) || [];
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          images: [...newPages[pageIndex].images],
          components: updatedComponents,
        };
        newPages[pageIndex].images[slotIndex] = imageUrl;
        return newPages;
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = async (pageIndex: number, slotIndex: number) => {
    try {
      const imageUrl = pages[pageIndex].images[slotIndex];
      if (!imageUrl) {
        throw new Error('No image to delete');
      }

      const key = extractKeyFromUrl(imageUrl);
      const response = await axios.delete(`${HTTP_BACKEND}/api/delete-image`, {
        params: { key },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      setPages((prev) => {
        const newPages = [...prev];
        const updatedComponents = newPages[pageIndex].components?.map((comp, compIndex) =>
          comp.type === 'photo' && compIndex === slotIndex
            ? { ...comp, image_url: '', original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } } }
            : comp
        ) || [];
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          images: [...newPages[pageIndex].images],
          components: updatedComponents,
        };
        newPages[pageIndex].images[slotIndex] = null;
        return newPages;
      });
    } catch (error) {
      console.error('Error removing image:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to remove image. Please try again.');
      }
    }
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pages.length > 1) {
      setPages((prev) => {
        const newPages = prev.filter((_, index) => index !== pageIndex);
        const newActivePage = Math.min(activePage, newPages.length - 1);
        setActivePage(newActivePage);
        return newPages;
      });
    }
  };

  const addPage = () => {
    setPages((prev) => {
      const newPages = [
        ...prev,
        { layout: 0, images: [null, null, null, null], message: '', components: availableLayouts[0].components },
      ];
      setActivePage(newPages.length - 1);
      return newPages;
    });
  };

  const getImageSlotCount = (layoutId: number): number => {
    const categoryIndex = Math.floor(layoutId / 10);
    const layoutIndex = layoutId % 10;

    if (categoryIndex >= 0 && categoryIndex < layoutCategories.length) {
      const category = layoutCategories[categoryIndex];
      if (layoutIndex >= 0 && layoutIndex < category.layouts.length) {
        return category.layouts[layoutIndex]();
      }
    }
    return 4; // Default to 4 slots if layout not found
  };

  if (!projectData) return <p className="p-10">Loading project...</p>;

  const mapLayoutIdToLayout = (layoutId: number): Layout => {
    const categoryIndex = Math.floor(layoutId / 10);
    const layoutIndex = layoutId % 10;
    console.log(layoutIndex);
    const layoutPosition = categoryIndex >= 0 && categoryIndex < availableLayouts.length ? categoryIndex : 0;
    return availableLayouts[layoutPosition] || availableLayouts[0];
  };
  //@ts-expect-error : Not sure of the types
  const mappedPages: Page[] = pages.map((page, index) => ({
    guid: page.guid || `page-${index + 1}`,
    layout: mapLayoutIdToLayout(page.layout),
    components: page.components || availableLayouts[page.layout].components,
  }));

  return (
    <div>
      <Header isSignedIn={false} />
      <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <section className="py-12 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {projectData.projectName}
              </h1>
              <p className="text-gray-700 text-lg mb-4">
                {projectData.eventDescription}
              </p>
              <div className="mt-6 space-x-4">
                <button className="bg-white border text-purple-600 rounded-xs px-4 py-2 hover:shadow">
                  How it Works
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xs hover:bg-purple-700">
                  Contribute
                </button>
              </div>
            </div>
            <div className="overflow-hidden shadow-lg">
              {projectData.imageKey && (
                <Image
                  src={getImageUrl(projectData.imageKey) ?? ''}
                  alt="Event"
                  width={600}
                  height={400}
                  
                />
              )}
            </div>
          </section>

          <StepIndicator currentStep={1} />

          <section className="mb-16 mt-6">
            <h2 className="text-4xl font-bold mb-7">Contribute</h2>
            <ol className="text-gray-700 list-decimal list-inside mb-6">
              <li>
                Click <strong>Add Text</strong> in the layout below to add a
                memory you have of John.
              </li>
              <li>
                Click <strong>Add a Photo</strong> to add a photo of you and John.
              </li>
            </ol>

            <PageNavigation
              pages={pages}
              activePage={activePage}
              setActivePage={setActivePage}
              addPage={addPage}
              handleDeletePage={handleDeletePage}
            />

            <div className="space-y-6">

              <LayoutEditorPage
                //@ts-expect-error : Not sure of the types
                pages={mappedPages}
                //@ts-expect-error : Not sure of the types
                setPages={(newPages: Page[]) => {
                  const updatedPages = newPages.map((page, index) => ({
                    layout: layoutCategories.findIndex((cat) => cat.title === availableLayouts[page.layout]?.name),
                    images: pages[index].images,
                    message: (page as ExtendedPage).components?.find((comp) => comp.type === 'paragraph')?.value || '',
                    components: (page as ExtendedPage).components,
                  }));
                  setPages(updatedPages);
                }}
                currentPageIndex={activePage}
                setCurrentPageIndex={setActivePage}
                availableLayouts={availableLayouts}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
                uploading={uploading}
                error={error}
              />
            </div>
          </section>
          <TipsBox onNextClick={handleNextClick} />
        </div>
      </div>
      <Footer />
      <LayoutPickerModal
        open={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        onSelect={(layoutId: number) => {
          setPages((prev) => {
            const newPages = [...prev];
            const currentImages = [...newPages[activePage].images];
            const newSlotCount = getImageSlotCount(layoutId);
            newPages[activePage] = {
              layout: layoutId,
              images: [
                ...currentImages.slice(0, Math.min(currentImages.length, newSlotCount)),
                ...Array(Math.max(0, newSlotCount - currentImages.length)).fill(null),
              ],
              message: newPages[activePage].message,
              components: availableLayouts[layoutId].components,
            };
            return newPages;
          });
          setShowLayoutModal(false);
        }}
        selectedLayout={pages[activePage].layout}
      />
      <SignatureEditModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        signature={signature}
        setSignature={setSignature}
      />
    </div>
  );
}