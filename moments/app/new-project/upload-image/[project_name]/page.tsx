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
import VideoModal from '@/components/VideoModal';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';
import { CurrentUser, Layout } from '@/types/frontlayout.types';
import { useAuth } from '@clerk/nextjs';


// Custom debounce hook
function useDebounce<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export default function NewEventPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const isSaving = useRef<boolean>(false);
  const params = useParams();
  const {
    setImageKey,
    projectId,
    setLayouts,
    layouts,
    eventTypes,
    setProjectName: setStoreProjectName,
    setEventDescription,
  } = useProjectStore();
  const [shareLink, setShareLink] = useState<string>('');
  const { isSignedIn } = useCurrentUser() as CurrentUser;
  const router = useRouter();
  const videoSrc = 'https://pub-e59ed743ceb3452ea4c0987a8c6bd376.r2.dev/VN20250623_233347.mp4';
  const { getToken } = useAuth();


  const handleDashboardClick = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      toast.error('Please sign in first');
    }
  };

  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      try {
        const shareLink = `${window.location.origin}/contribution/${projectId}`;
        setShareLink(shareLink);
      } catch (error) {
        console.error('Error setting share link:', error);
      }
    }
  }, [projectId]);

  const { imageKey: storedImageKey } = useProjectStore();
  const fallbackProjectName = useProjectStore.getState().projectName || params?.project_name || '';
  const fallbackProjectDescription = useProjectStore.getState().eventDescription || '';
  const decodedProjectName = typeof fallbackProjectName === 'string' ? fallbackProjectName.replace(/%20/g, ' ') : '';

  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [projectImageKey, setProjectImageKeyState] = useState<string | null>(null);

  useEffect(() => {
    setProjectName(decodedProjectName);
    setProjectDescription(
      Array.isArray(fallbackProjectDescription)
        ? fallbackProjectDescription.join(' ')
        : fallbackProjectDescription
    );
    setProjectImageKeyState(storedImageKey ?? null);
  }, [decodedProjectName, fallbackProjectDescription, storedImageKey]);

  // Save project data to localStorage
  useEffect(() => {
    if (projectId && projectName && (projectImageKey || projectDescription)) {
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

  // Load or generate layouts on mount
  useEffect(() => {
    const loadAndGenerateLayouts = async () => {
      if (!projectId) return;

      // Load existing layouts from localStorage
      const savedLayouts = localStorage.getItem(`layouts-${projectId}`);
      if (savedLayouts) {
        const parsedLayouts: Layout[] = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
        //console.log('Loaded layouts from localStorage:', parsedLayouts);
        return;
      }

      // Generate new layouts if none exist
      const defaultLayouts: Layout[] = [
        {
          id: uuidv4(),
          pageType: 'front_cover',
          isPreview: true,
          config: {
            imageKey: projectImageKey || storedImageKey,
            title: projectName,
            description: projectDescription,
            backgroundColor: '#ffffff',
            alignment: 'center',
            borderStyle: {
              type: 'dashed',
              width: 2,
              color: '#gray-400',
              inset: 4,
            },
            containerStyle: {
              shadow: 'shadow-2xl',
              border: 'border-4 border-gray-300',
              width: '150mm',
              height: '210mm',
              padding: '2rem',
              display: 'flex flex-col items-center',
            },
            titleStyle: {
              fontSize: 'text-3xl',
              fontWeight: 'font-bold',
              marginBottom: 'mb-6',
              textAlign: 'text-center',
              marginTop: 'mt-3',
              wordBreak: 'break-words',
            },
            imageStyle: {
              width: 280,
              height: 200,
              objectFit: 'object-contain',
              shadow: 'shadow-md',
              marginBottom: 'mb-6',
            },
            descriptionStyle: {
              maxWidth: '80%',
              color: 'text-gray-700',
              fontSize: 'text-[13px]',
              textAlign: 'text-center',
              marginTop: 'mt-4',
              fontStyle: 'italic',
              lineHeight: 'leading-relaxed',
              wordBreak: 'break-words',
            },
            hoverEffects: {
              rotate: 'hover:rotate-3d',
              scale: 'hover:scale-105',
              shadow: 'hover:shadow-2xl',
            },
          },
        },
        {
          id: uuidv4(),
          pageType: 'back_cover',
          isPreview: true,
          config: {
            text: 'Thank you for being part of our story.',
            alignment: 'center',
            backgroundColor: '#ffffff',
          },
        },
      ];

      const layouts: Layout[] = defaultLayouts.concat(
        defaultLayouts
          .filter((layout) => layout.isPreview)
          .map((layout) => ({
            ...layout,
            id: uuidv4(),
            isPreview: false,
          }))
      );

      setLayouts(layouts);
      localStorage.setItem(`layouts-${projectId}`, JSON.stringify(layouts));
      const token = await getToken();
      if (!token) {
        toast.error('Failed to get token');
        router.push('/');
      }
      try {
        await axios.post(
          `${HTTP_BACKEND}/api/layouts`,
          { projectId, layouts },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
       // toast.success('Layouts saved successfully');
      } catch (error) {
        console.error('Error saving layouts:', error);
        toast.error('Failed to save layouts');
      }
    };

    loadAndGenerateLayouts();
  }, [projectId, setLayouts, getToken, router, storedImageKey, projectName, projectDescription, projectImageKey]);

  // Update layouts when project details change
  const debouncedUpdateLayouts = useDebounce(async () => {
    if (isSaving.current || !projectId) return;

    isSaving.current = true;
    // console.log('Debounced updateLayouts called with:', {
    //   projectId,
    //   projectName,
    //   projectImageKey,
    //   projectDescription,
    // });

    const savedLayouts = localStorage.getItem(`layouts-${projectId}`);
    if (savedLayouts) {
      const parsedLayouts: Layout[] = JSON.parse(savedLayouts);
      const updatedLayouts: Layout[] = parsedLayouts.map((layout) => {
        if (layout.pageType === 'front_cover') {
          return {
            ...layout,
            config: {
              ...layout.config,
              imageKey: projectImageKey || storedImageKey,
              title: projectName,
              description: projectDescription,
            },
          };
        }
        return layout;
      });

      setLayouts(updatedLayouts);
      localStorage.setItem(`layouts-${projectId}`, JSON.stringify(updatedLayouts));
      const token = await getToken();
      if (!token) {
        toast.error('Failed to get token');
        router.push('/');
      }
      try {
        await axios.post(
          `${HTTP_BACKEND}/api/layouts`,
          { projectId, layouts: updatedLayouts },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // toast.success('Layouts updated successfully');
      } catch (error) {
        console.error('Error updating layouts:', error);
        toast.error('Failed to update layouts');
      }
    }
    isSaving.current = false;
  }, 1000);

  useEffect(() => {
    debouncedUpdateLayouts();
  }, [projectId, projectName, projectImageKey, storedImageKey,debouncedUpdateLayouts,projectDescription]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToDefault = async () => {
    if (!eventTypes) {
      toast.error('Event type not specified');
      setShowResetConfirm(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      toast.error('Failed to get token');
      router.push('/');
    }
    try {
      const response = await axios.get<{ description: string }>(`${HTTP_BACKEND}/event-type`, {
        params: { name: eventTypes },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjectDescription(response.data.description);
      setEventDescription(response.data.description);
      toast.success('Description reset to default');
    } catch (error) {
      console.error('Error fetching default description:', error);
      toast.error('Failed to reset description');
    }
    setShowResetConfirm(false);
  };

  const { handleImageChange } = useImageUpload({
    onSuccess: (key: string, file: File) => {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setProjectImageKeyState(key);
      setImageKey(key);
    },
    projectId: projectId || '',
  });

  const saveUpdatedLayouts = async () => {
    if (isSaving.current || !projectId) return;

    isSaving.current = true;
    // console.log('saveUpdatedLayouts called with:', {
    //   projectId,
    //   projectName,
    //   projectImageKey,
    //   projectDescription,
    // });

    try {
      const savedLayouts = localStorage.getItem(`layouts-${projectId}`);
      let updatedLayouts = layouts; // Use current layouts state as fallback

      if (savedLayouts) {
        const parsedLayouts: Layout[] = JSON.parse(savedLayouts);
        updatedLayouts = parsedLayouts.map((layout) => {
          if (layout.pageType === 'front_cover') {
            return {
              ...layout,
              config: {
                ...layout.config,
                imageKey: projectImageKey || storedImageKey,
                title: projectName,
                description: projectDescription,
              },
            };
          }
          return layout;
        });
      }

      // Update store state
      setLayouts(updatedLayouts);
      setStoreProjectName(projectName);
      setEventDescription(projectDescription);
      if (projectImageKey) {
        setImageKey(projectImageKey);
      }

      // Save to localStorage
      localStorage.setItem(`layouts-${projectId}`, JSON.stringify(updatedLayouts));
      const token = await getToken();
      if (!token) {
        toast.error('Failed to get token');
        router.push('/');
      }
      // Save to backend
      await axios.post(
        `${HTTP_BACKEND}/api/layouts`,
        { projectId, layouts: updatedLayouts },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // toast.success('Layouts updated successfully');
    } catch (error) {
      console.error('Error updating layouts:', error);
      toast.error('Failed to update layouts');
    } finally {
      isSaving.current = false;
    }
  };

  const handleSaveEdit = () => {
    saveUpdatedLayouts();
    setShowEditModal(false);
  };

  // Find the front_cover layout to render
  const frontCoverLayout = layouts.find(
    (layout) => layout.pageType === 'front_cover' && layout.isPreview
  ) as Layout | undefined;

  return (
    <div className="min-h-screen bg-white">
      <Header isSignedIn={isSignedIn ?? false} />
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-4 md:px-6 z-50">
        {/* Top section with avatar and title */}
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-bold">N</div>
          <span className="font-semibold">Invite Your Friends</span>
        </div>

        {/* Middle section: share link and copy button */}
        <div className="flex flex-col items-stretch gap-2 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:flex-row md:items-center">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="bg-white text-black px-4 py-2 rounded w-full md:w-auto"
          />
          <Button
            className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {/* Right section: dashboard and edit buttons */}
        <div className="flex gap-2 mt-4 md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
          <Button
            className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
            onClick={handleDashboardClick}
          >
            Dashboard
          </Button>
          <Button
            className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
            onClick={() => setShowEditModal(true)}
          >
            Edit this Page
          </Button>
        </div>
      </div>


      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">{projectName}</h1>
            <p className="text-lg text-gray-700 mb-4">{projectDescription}</p>
            <Button variant="outline" onClick={() => setShowVideoModal(true)}>
              How it Works
            </Button>
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
              height={600}
              className="shadow-md h-[350px]"
            />
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-4xl font-bold mb-4 text-left">Contribute</h2>
          <p className="text-md text-gray-600 mb-6 text-left">
            Add a memory, well wish, or photo. Want to add more photos? Simply click view layout on the contribution page
            and view the other layouts and update the photos and description. Share it to your friends, family, and
            colleagues.
          </p>

          {frontCoverLayout ? (
            <div className="flex justify-center">
              <div
                className={`relative bg-white ${frontCoverLayout.config.containerStyle?.shadow ?? ''} ${frontCoverLayout.config.containerStyle?.border ?? ''
                  } w-[150mm] h-[210mm] p-8 flex flex-col items-center overflow-hidden transform-gpu transition-transform duration-500 ease-in-out ${frontCoverLayout.config.hoverEffects?.rotate ?? ''
                  } ${frontCoverLayout.config.hoverEffects?.scale ?? ''} ${frontCoverLayout.config.hoverEffects?.shadow ?? ''
                  }`}
              >
                <div className="absolute inset-4 border-2 border-dashed border-gray-400 pointer-events-none"></div>
                <div className="relative flex flex-col items-center w-full">
                  <h1
                    className={`${frontCoverLayout.config.titleStyle?.fontSize ?? ''} ${frontCoverLayout.config.titleStyle?.fontWeight ?? ''
                      } ${frontCoverLayout.config.titleStyle?.marginBottom ?? ''} ${frontCoverLayout.config.titleStyle?.textAlign ?? ''
                      } ${frontCoverLayout.config.titleStyle?.marginTop ?? ''} break-words`}
                  >
                    {frontCoverLayout.config.title || 'No Title'}
                  </h1>
                  {frontCoverLayout.config.imageKey && (
                    <div className={frontCoverLayout.config.imageStyle?.marginBottom ?? ''}>
                      <Image
                        src={
                          typeof frontCoverLayout.config.imageKey === 'string' &&
                            frontCoverLayout.config.imageKey.startsWith('data:')
                            ? frontCoverLayout.config.imageKey
                            : getImageUrl(frontCoverLayout.config.imageKey) || ''
                        }
                        alt="Celebration"
                        width={frontCoverLayout.config.imageStyle?.width ?? 280}
                        height={frontCoverLayout.config.imageStyle?.height ?? 200}
                        className={`${frontCoverLayout.config.imageStyle?.objectFit ?? ''} ${frontCoverLayout.config.imageStyle?.shadow ?? ''
                          }`}
                      />
                    </div>
                  )}
                  {frontCoverLayout.config.description && (
                    <div
                      className={`${frontCoverLayout.config.descriptionStyle?.maxWidth ?? ''} ${frontCoverLayout.config.descriptionStyle?.color ?? ''
                        } ${frontCoverLayout.config.descriptionStyle?.fontSize ?? ''} ${frontCoverLayout.config.descriptionStyle?.textAlign ?? ''
                        } ${frontCoverLayout.config.descriptionStyle?.marginTop ?? ''}`}
                    >
                      <p
                        className={`${frontCoverLayout.config.descriptionStyle?.fontStyle ?? ''} ${frontCoverLayout.config.descriptionStyle?.lineHeight ?? ''
                          } break-words`}
                      >
                        {frontCoverLayout.config.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>No front cover layout found. Please try refreshing or editing the page.</p>
          )}
        </div>
      </main>
      <Footer />

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoSrc={videoSrc} />

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-2">🎉 Project Created!</h3>
            <p className="text-sm mb-2">Your project has been created and this is the landing page for your project!</p>
            <p className="text-sm mb-2 font-bold">✏️ Edit this Page</p>
            <p className="text-xs mb-2">Click Edit this Page at the top to customize it.</p>
            <p className="text-sm font-bold">📨 Invite Friends!</p>
            <p className="text-xs">Copy the sharing link above to invite your friends.</p>
            <div className="text-right mt-4">
              <Button size="sm" onClick={() => setShowModal(false)}>
                Got it
              </Button>
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
              className="w-full p-2 border rounded mb-4 font-bold"
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
            />

            <label className="block font-semibold mb-1">Project Description</label>
            <textarea
              rows={6}
              className="w-full p-2 border rounded mb-4"
              value={projectDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectDescription(e.target.value)}
            />

            <div className="flex justify-between items-center mt-4">
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset to Default
              </button>
              <div className="space-x-2">
                <Button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-2">Confirm Reset</h3>
            <p className="text-sm mb-4">Are you sure you want to reset the description to the default?</p>
            <div className="flex justify-end space-x-2">
              <Button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleResetToDefault}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}