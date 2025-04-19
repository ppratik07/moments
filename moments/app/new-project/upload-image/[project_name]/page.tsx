'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { Header } from '@/components/landing/Header';
import { getImageUrl } from '@/helpers/getImageUrl';
import { uploadFileToR2 } from '@/lib/upload';

export default function NewEventPage() {
  const [showModal, setShowModal] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const shareLink = 'http://momentsmemorybooks.com/34534';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();

  const {
    imageKey: storedImageKey,
    //setImageKey,
  } = useProjectStore();

  //Getting the values from zustand
  const fallbackProjectName = useProjectStore.getState().projectName || params.project_name || '';
  const fallbackProjectDescription = useProjectStore.getState().eventDescription ||'';
  const decodedProjectName = typeof fallbackProjectName === 'string' ? fallbackProjectName.replace(/%20/g, " ") : '';

  const [projectName, setProjectName] = useState<string>(decodedProjectName);
  const [projectDescription, setProjectDescription] = useState<string>(
    Array.isArray(fallbackProjectDescription) ? fallbackProjectDescription.join(' ') : fallbackProjectDescription
  );
  const [projectImageKey, setProjectImageKeyState] = useState<string | null>(storedImageKey ?? null);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setProjectImageKeyState(previewUrl);

    try {
      const uploadedKey = await uploadFileToR2(file);
      setProjectImageKeyState(uploadedKey); // update local
      //setProjectImageKey(uploadedKey);      // persist to Zustand
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  return (
    // Top Navigation
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-bold">N</div>
          <span className="font-semibold">Invite Your Friends</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <input type="text" value={shareLink} readOnly className="bg-white text-black px-4 py-2 rounded" />
          <Button className="bg-primary text-white px-4 py-2 rounded" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <Button className="bg-primary text-white px-4 py-2 rounded">Dashboard</Button>
          <Button className="bg-primary text-white px-4 py-2 rounded" onClick={() => setShowEditModal(true)}>
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
            <Button variant="outline">How it Works</Button>
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

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-4">Contribute</h2>
          <p className="text-md text-gray-600 mb-6">
            Add a memory, well wish, or photo. Want to add more photos? Simply click below.
          </p>
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 italic">Upload photo or memory form here</p>
          </div>
        </div>
      </main>

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
              {projectImageKey && (
                <Image
                  src={
                    typeof projectImageKey === 'string' && projectImageKey.startsWith('data:')
                      ? projectImageKey
                      : getImageUrl(projectImageKey) || ''
                  }
                  alt="Project"
                  className="rounded-md"
                  width={300}
                  height={250}
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
              value={fallbackProjectDescription}
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
    </div>
  );
}
