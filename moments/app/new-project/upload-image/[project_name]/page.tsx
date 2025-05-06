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

export default function NewEventPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const params = useParams();
  const { setImageKey, projectId, setLayouts, eventTypes } = useProjectStore();
  const [shareLink, setShareLink] = useState<string>('');
  const { isSignedIn } = useCurrentUser();
  const router = useRouter();
  const videoSrc = 'https://youtu.be/embed/TyF3IumWiH8?si=sx4704VKu_sYQ-IC';

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

  // Initialize and persist layouts for book pages
  useEffect(() => {
    const generateAndSaveLayouts = async () => {
      const defaultLayouts = [
        {
          id: uuidv4(),
          pageType: 'front_cover',
          isPreview: true,
          config: {
            imageKey: projectImageKey || storedImageKey,
            title: projectName,
            backgroundColor: '#ffffff',
            alignment: 'center',
          },
        },
        {
          id: uuidv4(),
          pageType: 'title_page',
          isPreview: false,
          config: {
            title: projectName,
            subtitle: '',
            alignment: 'center',
            fontSize: 24,
          },
        },
        {
          id: uuidv4(),
          pageType: 'section_page',
          section: 'friends',
          isPreview: false,
          config: {
            title: 'Friends',
            alignment: 'right',
            backgroundColor: '#f0f0f0',
          },
        },
        {
          id: uuidv4(),
          pageType: 'section_page',
          section: 'family',
          isPreview: false,
          config: {
            title: 'Family',
            alignment: 'right',
            backgroundColor: '#f0f0f0',
          },
        },
        {
          id: uuidv4(),
          pageType: 'section_page',
          section: 'coworkers',
          isPreview: false,
          config: {
            title: 'Coworkers',
            alignment: 'right',
            backgroundColor: '#f0f0f0',
          },
        },
        {
          id: uuidv4(),
          pageType: 'section_page',
          section: 'other_relationship',
          isPreview: false,
          config: {
            title: 'Other Relationships',
            alignment: 'right',
            backgroundColor: '#f0f0f0',
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

      const layouts = defaultLayouts.concat(
        defaultLayouts
          .filter((layout) => layout.isPreview)
          .map((layout) => ({
            ...layout,
            id: uuidv4(),
            isPreview: false,
          }))
      );

      setLayouts(layouts);

      if (projectId) {
        localStorage.setItem(`layouts-${projectId}`, JSON.stringify(layouts));
        try {
          await axios.post(
            `${HTTP_BACKEND}/api/layouts`,
            { projectId, layouts },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          toast.success('Layouts saved successfully');
        } catch (error) {
          console.error('Error saving layouts:', error);
          toast.error('Failed to save layouts');
        }
      }
    };

    generateAndSaveLayouts();
  }, [projectId, projectName, projectImageKey, storedImageKey, setLayouts]);

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

    try {
      const response = await axios.get(`${HTTP_BACKEND}/event-type`, {
        params: { name: eventTypes },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setProjectDescription(response.data.description);
      toast.success('Description reset to default');
    } catch (error) {
      console.error('Error fetching default description:', error);
      toast.error('Failed to reset description');
    }
    setShowResetConfirm(false);
  };

  const { handleImageChange } = useImageUpload({
    onSuccess: (key, file) => {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setProjectImageKeyState(key);
      setImageKey(key);
    },
    projectId: projectId || '',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-bold">N</div>
          <span className="font-semibold">Invite Your Friends</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <input type="text" value={shareLink} readOnly className="bg-white text-black px-4 py-2 rounded" />
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={handleDashboardClick}>
            Dashboard
          </Button>
          <Button className="bg-primary text-white px-4 py-2 rounded cursor-pointer" onClick={() => setShowEditModal(true)}>
            Edit this Page
          </Button>
        </div>
      </div>

      <Header isSignedIn={isSignedIn ?? false} />

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
            Add a memory, well wish, or photo. Want to add more photos? Simply click view layout on the contribution page and view the other layouts and update the photos and description.
            Share it to your friends, family, and colleagues.
          </p>

          <div className="flex justify-center">
            <div className="relative bg-white shadow-2xl border-4 border-gray-300 w-[150mm] h-[210mm] p-8 flex flex-col items-center overflow-hidden transform-gpu transition-transform duration-500 ease-in-out hover:rotate-3d hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-4 border-2 border-dashed border-gray-400 pointer-events-none"></div>
              <div className="relative flex flex-col items-center w-full">
                <h1 className="text-3xl font-bold mb-6 break-words text-center mt-3">{projectName}</h1>
                {projectImageKey && (
                  <div className="mb-6">
                    <Image
                      src={
                        typeof projectImageKey === 'string' && projectImageKey.startsWith('data:')
                          ? projectImageKey
                          : getImageUrl(projectImageKey) || ''
                      }
                      alt="Celebration"
                      width={280}
                      height={200}
                      className="object-contain shadow-md"
                    />
                  </div>
                )}
                <div className="max-w-[80%] text-gray-700 text-[13px] text-center mt-4">
                  <p className="break-words italic leading-relaxed">{projectDescription}</p>
                </div>
              </div>
            </div>
          </div>
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
            <p className="text-xs mb-2">Click “Edit this Page” at the top to customize it.</p>
            <p className="text-sm font-bold">📨 Invite Friends!</p>
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
              className="w-full p-2 border rounded mb-4 font-bold"
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
                  onClick={() => setShowEditModal(false)}
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