'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { Header } from '@/components/landing/Header';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useImageUpload } from '@/hooks/useImageUpload';
import Footer from '@/pages/Footer';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';
import { PageLayout } from '@/components/contribution/PageLayout';
import { PageNavigation } from '@/components/contribution/PageNavigation';
import { Page, ProjectData, SignatureEditModal } from '@/components/contribution/SignatureEditModal';
import TipsBox from '@/components/contribution/TipsBox';
import LayoutPickerModal from '@/components/LayoutPickerModel';

export default function NewEventPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const { setImageKey, projectId } = useProjectStore();
  const [shareLink, setShareLink] = useState<string>('');
  const { isSignedIn } = useCurrentUser();
  const router = useRouter();

  // Contribution Page States
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState('Your Name Here');
  const [pages, setPages] = useState<Page[]>([
    { layout: 0, images: [null, null, null, null], message: '' },
  ]);
  const [activePage, setActivePage] = useState(0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const handleDashboardClick = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      toast.error('Please sign in first');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/contribution/${projectId}`);
      const raw = localStorage.getItem(`project-${projectId}`);
      if (raw) setProjectData(JSON.parse(raw));
    }
  }, [projectId]);

  const {
    imageKey: storedImageKey,
  } = useProjectStore();

  const fallbackProjectName = useProjectStore.getState().projectName || (params?.project_name ?? '');
  const fallbackProjectDescription = useProjectStore.getState().eventDescription || '';
  const decodedProjectName = typeof fallbackProjectName === 'string' ? fallbackProjectName.replace(/%20/g, " ") : '';

  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [projectImageKey, setProjectImageKeyState] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && projectName && projectImageKey && projectDescription) {
      localStorage.setItem(
        `project-${projectId}`,
        JSON.stringify({
          projectName,
          imageKey: projectImageKey,
          eventDescription: projectDescription,
        })
      );
    }
  }, [projectId, projectName, projectImageKey, projectDescription]);

  useEffect(() => {
    setProjectName(decodedProjectName);
    setProjectDescription(
      Array.isArray(fallbackProjectDescription) ? fallbackProjectDescription.join(' ') : fallbackProjectDescription
    );
    setProjectImageKeyState(storedImageKey ?? null);
  }, [decodedProjectName, fallbackProjectDescription, storedImageKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { handleImageChange } = useImageUpload({
    onSuccess: (key, file) => {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setProjectImageKeyState(key);
      setImageKey(key);
    },
  });

  // Contribution Page Logic
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
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image to R2: ${uploadResponse.statusText}`);
      }

      const imageUrl = `https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane/${key}`;

      setPages((prev) => {
        const newPages = [...prev];
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          images: [...newPages[pageIndex].images],
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
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          images: [...newPages[pageIndex].images],
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
        { layout: 0, images: [null, null, null, null], message: '' },
      ];
      setActivePage(newPages.length - 1);
      return newPages;
    });
  };

  const getImageSlotCount = (layoutId: number): number => {
    const categoryIndex = Math.floor(layoutId / 10);
    const layoutIndex = layoutId % 10;
    const layoutCategories = [
      { title: 'Message Only', layouts: [() => 0, () => 0] },
      {
        title: 'Photos Only',
        layouts: [() => 2, () => 2, () => 3, () => 3, () => 4],
      },
      {
        title: 'Message with Photos',
        layouts: [() => 1, () => 1, () => 2, () => 2, () => 1],
      },
    ];

    if (categoryIndex >= 0 && categoryIndex < layoutCategories.length) {
      const category = layoutCategories[categoryIndex];
      if (layoutIndex >= 0 && layoutIndex < category.layouts.length) {
        return category.layouts[layoutIndex]();
      }
    }
    return 4;
  };

  if (!projectData) return <p className="p-10">Loading project...</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-bold">N</div>
          <span className="font-semibold">Invite Your Friends</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <input type="text" value={shareLink} readOnly className="bg-white text-black px-4 py-2 rounded" />
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={handleDashboardClick}>Dashboard</Button>
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={() => setShowEditModal(true)}>
            Edit this Page
          </Button>
        </div>
      </div>

      <Header isSignedIn={false} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">{projectName}</h1>
            <p className="text-lg text-gray-700 mb-4">{projectDescription}</p>
            <Button variant="outline" className='cursor-pointer'>How it Works</Button>
          </div>

          {projectImageKey && (
            <Image
              src={
                typeof projectImageKey === 'string' && projectImageKey.startsWith('data:')
                  ? projectImageKey
                  : getImageUrl(projectImageKey) || ''
              }
              alt="Celebration"
              width={600}
              height={400}
              className="shadow-md rounded-lg"
            />
          )}
        </div>

        <section className="mt-12">
          
          <div className="mb-16 mt-6">
            <h2 className="text-3xl font-bold mb-7">Contribute</h2>
            <ol className="text-gray-700 list-decimal list-inside mb-6">
              <li>
                Click <strong>Add Text</strong> in the layout below to add a memory.
              </li>
              <li>
                Click <strong>Add a Photo</strong> to add a photo.
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
              {pages.map((page, index) => (
                <PageLayout
                  key={index}
                  page={page}
                  pageIndex={index}
                  activePage={activePage}
                  uploading={uploading}
                  error={error}
                  setActivePage={setActivePage}
                  setShowLayoutModal={setShowLayoutModal}
                  handleFileUpload={handleFileUpload}
                  handleRemoveImage={handleRemoveImage}
                  signature={signature}
                  editingMessage={editingMessage}
                  setEditingMessage={setEditingMessage}
                  setIsSignatureModalOpen={setIsSignatureModalOpen}
                  setPages={setPages}
                />
              ))}
            </div>
          </div>
          <TipsBox />
        </section>
      </main>
      <Footer />
      
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-2">🎉 Project Created!</h3>
            <p className="text-sm mb-2">
              Your project has been created and this is the landing page for your project!
            </p>
            <p className="text-sm mb-2 font-medium">✏️ Edit this Page</p>
            <p className="text-xs mb-2">Click “Edit this Page” at the top to customize it.</p>
            <p className="text-sm font-medium">📨 Invite Friends!</p>
            <p className="text-xs">Copy the sharing link above to invite your friends.</p>
            <div className="text-right mt-4">
              <Button size="sm" onClick={() => setShowModal(false)}>Got it</Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">✏️ Edit Landing Page</h2>

            <label className="block font-semibold mb-2">Project Photo</label>
            <div className="mb-4 relative">
              {(projectImageKey || preview) && (
                <Image
                  src={
                    preview ||
                    (typeof projectImageKey === 'string' && projectImageKey.startsWith('data:')
                      ? projectImageKey
                      : getImageUrl(projectImageKey) || '')
                  }
                  alt="Celebration"
                  width={600}
                  height={400}
                  className="shadow-md rounded-lg"
                />
              )}
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                onClick={() => fileInputRef.current?.click()}
              >
                ✏️
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <label className="block font-semibold mb-1">Project Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <label className="block font-semibold mb-1">Project Description</label>
            <textarea
              rows={6}
              className="w-full p-2 border rounded mb-4"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />

            <div className="flex justify-between items-center mt-4">
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => {
                  setProjectName(decodedProjectName);
                  setProjectDescription(
                    Array.isArray(fallbackProjectDescription)
                      ? fallbackProjectDescription.join(' ')
                      : fallbackProjectDescription
                  );
                  setProjectImageKeyState(storedImageKey ?? null);
                }}
              >
                Reset to Default
              </button>
              <div className="space-x-2">
                <Button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowEditModal(false)}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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