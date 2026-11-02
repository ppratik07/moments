'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useImageUpload } from '@/hooks/useImageUpload';
import SiteFooter from '@/components/layout/SiteFooter';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import VideoModal from '@/components/VideoModal';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';
import { CurrentUser, Layout } from '@/types/frontlayout.types';
import { useAuth } from '@clerk/nextjs';
import '@/app/stitch-landing.css';
import { cn } from '@/lib/utils';


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
    projectId: projectId || null,
    getAuthToken: () => getToken(),
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

  const inviteInitial = (projectName?.trim()[0] || 'N').toUpperCase();
  const toolbarButtonClass =
    'shrink-0 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 h-auto font-medium cursor-pointer';

  return (
    <div className="min-h-screen bg-white text-[var(--color-on-surface)]">
      {/* Invite toolbar */}
      <div className="relative z-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold"
              aria-hidden
            >
              {inviteInitial}
            </div>
            <span className="text-base font-semibold sm:text-lg">Invite Your Friends</span>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:max-w-xl lg:flex-1 lg:px-6">
            <input
              type="text"
              value={shareLink}
              readOnly
              aria-label="Share link"
              className="min-w-0 flex-1 truncate rounded-md bg-white px-4 py-2.5 text-sm text-black shadow-sm"
            />
            <Button className={toolbarButtonClass} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button className={toolbarButtonClass} onClick={handleDashboardClick}>
              Dashboard
            </Button>
            <Button className={toolbarButtonClass} onClick={() => setShowEditModal(true)}>
              Edit this Page
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-5xl">
              {projectName || 'Your project'}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">{projectDescription}</p>
            <Button
              variant="outline"
              className="mt-6 rounded-md border-gray-300 bg-white px-5 py-2 font-medium hover:bg-gray-50"
              onClick={() => setShowVideoModal(true)}
            >
              How it Works
            </Button>
          </div>

          {projectImageKey && (
            <div className="flex justify-center md:justify-end">
              <Image
                src={
                  typeof projectImageKey === 'string' && projectImageKey.startsWith('data:')
                    ? projectImageKey
                    : getImageUrl(projectImageKey) || ''
                }
                alt="Project cover"
                width={600}
                height={400}
                className="h-auto max-h-[360px] w-full max-w-lg rounded-lg object-cover shadow-md"
              />
            </div>
          )}
        </div>
      </main>

      <section className="border-t border-gray-100 bg-gray-50/90 py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-4xl font-bold text-[var(--color-on-surface)]">Contribute</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
            Add a memory, well wish, or photo. Want to add more photos? Simply click view layout on the
            contribution page and view the other layouts and update the photos and description. Share it to
            your friends, family, and colleagues.
          </p>

          {frontCoverLayout ? (
            <div className="mt-10 flex justify-center">
              <div
                className={cn(
                  'relative flex h-[210mm] w-[150mm] flex-col items-center overflow-hidden bg-white p-8 transform-gpu transition-transform duration-500 ease-in-out',
                  frontCoverLayout.config.containerStyle?.shadow ?? 'shadow-2xl',
                  frontCoverLayout.config.containerStyle?.border ?? 'border border-gray-200',
                  frontCoverLayout.config.hoverEffects?.rotate ?? '',
                  frontCoverLayout.config.hoverEffects?.scale ?? '',
                  frontCoverLayout.config.hoverEffects?.shadow ?? ''
                )}
              >
                <div className="pointer-events-none absolute inset-4 rounded-sm border-2 border-dashed border-gray-400" />
                <div className="relative flex w-full flex-col items-center">
                  <h3
                    className={cn(
                      'break-words',
                      frontCoverLayout.config.titleStyle?.fontSize ?? 'text-3xl',
                      frontCoverLayout.config.titleStyle?.fontWeight ?? 'font-bold',
                      frontCoverLayout.config.titleStyle?.marginBottom ?? 'mb-6',
                      frontCoverLayout.config.titleStyle?.textAlign ?? 'text-center',
                      frontCoverLayout.config.titleStyle?.marginTop ?? 'mt-3'
                    )}
                  >
                    {frontCoverLayout.config.title || 'No Title'}
                  </h3>
                  {frontCoverLayout.config.imageKey && (
                    <div className={frontCoverLayout.config.imageStyle?.marginBottom ?? 'mb-6'}>
                      <Image
                        src={
                          typeof frontCoverLayout.config.imageKey === 'string' &&
                          frontCoverLayout.config.imageKey.startsWith('data:')
                            ? frontCoverLayout.config.imageKey
                            : getImageUrl(frontCoverLayout.config.imageKey) || ''
                        }
                        alt="Book preview"
                        width={frontCoverLayout.config.imageStyle?.width ?? 280}
                        height={frontCoverLayout.config.imageStyle?.height ?? 200}
                        className={cn(
                          frontCoverLayout.config.imageStyle?.objectFit ?? 'object-contain',
                          frontCoverLayout.config.imageStyle?.shadow ?? 'shadow-md'
                        )}
                      />
                    </div>
                  )}
                  {frontCoverLayout.config.description && (
                    <div
                      className={cn(
                        frontCoverLayout.config.descriptionStyle?.maxWidth ?? 'max-w-[80%]',
                        frontCoverLayout.config.descriptionStyle?.color ?? 'text-gray-700',
                        frontCoverLayout.config.descriptionStyle?.fontSize ?? 'text-[13px]',
                        frontCoverLayout.config.descriptionStyle?.textAlign ?? 'text-center',
                        frontCoverLayout.config.descriptionStyle?.marginTop ?? 'mt-4'
                      )}
                    >
                      <p
                        className={cn(
                          'break-words',
                          frontCoverLayout.config.descriptionStyle?.fontStyle ?? 'italic',
                          frontCoverLayout.config.descriptionStyle?.lineHeight ?? 'leading-relaxed'
                        )}
                      >
                        {frontCoverLayout.config.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-600">
              No front cover layout found. Please try refreshing or editing the page.
            </p>
          )}
        </div>
      </section>

      <SiteFooter />

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoSrc={videoSrc} />

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="project-created-title"
          >
            <h3 id="project-created-title" className="text-lg font-bold text-gray-900">
              🎉 Project Created!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Your project has been created and this is the landing page for your project!
            </p>
            <p className="mt-4 text-sm font-bold text-gray-900">✏️ Edit this Page</p>
            <p className="text-xs text-gray-600">Click Edit this Page at the top to customize it.</p>
            <p className="mt-3 text-sm font-bold text-gray-900">📩 Invite Friends!</p>
            <p className="text-xs text-gray-600">Copy the sharing link above to invite your friends.</p>
            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                className="rounded-md bg-neutral-900 px-5 text-white hover:bg-neutral-800"
                onClick={() => setShowModal(false)}
              >
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