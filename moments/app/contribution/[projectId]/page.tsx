'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/helpers/getImageUrl';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import ChatSupportButton from '@/components/ChatSupportButton';
import LayoutPickerModal from '@/components/LayoutPickerModel';
import { HTTP_BACKEND } from '@/utils/config';
import axios from 'axios';

// Separate MessageEditor component
interface MessageEditorProps {
  message: string;
  setMessage: (value: string) => void;
  setEditingMessage: (value: boolean) => void;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ message, setMessage, setEditingMessage }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add your message here..."
        className="w-full p-3 border border-gray-300 rounded-md min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button
          className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => setEditingMessage(false)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={() => setEditingMessage(false)}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default function ContributionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signature, setSignature] = useState('Your Name Here');
  const [message, setMessage] = useState('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<number | null>(0);
  const [editingMessage, setEditingMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams();

  interface ProjectData {
    projectName: string;
    eventDescription: string;
    imageKey?: string;
  }

  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(`project-${projectId}`);
    if (raw) setProjectData(JSON.parse(raw));
  }, [projectId]);

  // Utility function to extract the key from the public URL
  const extractKeyFromUrl = (url: string): string => {
    const prefix = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane/';
    return url.replace(prefix, '');
  };

  // Handle file upload using presigned URL to R2
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
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
      const response = await fetch(`${HTTP_BACKEND}/api/get-presign-url?fileType=${encodeURIComponent(file.type)}`);
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

      setUploadedImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls[activeSlot] = imageUrl;
        return newUrls;
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  // Handle image removal
  const handleRemoveImage = async (index: number) => {
    try {
      const imageUrl = uploadedImageUrls[index];
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

      setUploadedImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = null;
        return newUrls;
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      setError(error.response?.data?.error || 'Failed to remove image. Please try again.');
    }
  };

  // Define layout categories and their associated rendering functions
  const layoutCategories = [
    {
      title: 'Message Only',
      layouts: [
        () => (
          <>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
          </>
        ),
        () => (
          <>
            <div className="text-lg italic font-medium text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="bg-gray-50 border-l-4 border-purple-400 pl-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p className="italic">{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    <div className="text-lg mb-1 inline-block">⊕</div> ADD TEXT
                  </div>
                )}
              </div>
            )}
          </>
        ),
      ],
    },
    {
      title: 'Photos Only',
      layouts: [
        // Two photos side by side
        () => (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div
                  id={i.toString()}
                  key={i}
                  className="bg-gray-100 relative h-72 flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrls[i] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImageUrls[i]!}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          width={500}
                          height={300}
                        />
                        <button
                          className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          onClick={() => setActiveSlot(i)}
                        />
                        <div className={uploading ? 'opacity-50' : ''}>
                          <div className="text-lg mb-1">⊕</div>
                          {uploading && activeSlot === i ? 'Uploading...' : 'ADD A PHOTO'}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
              {error && <div className="text-red-500 text-sm mt-2 col-span-2">{error}</div>}
            </div>
          ),
        // One photo on top of another
        () => (
          <div className="grid grid-rows-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
              >
                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                <div className="relative z-10 text-center">
                  {uploadedImageUrls[i] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={uploadedImageUrls[i]!}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                        width={500}
                        height={300}
                      />
                      <button
                        className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                        onClick={() => handleRemoveImage(i)}
                        title="Remove image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        onClick={() => setActiveSlot(i)}
                      />
                      <div className={uploading ? 'opacity-50' : ''}>
                        <div className="text-lg mb-1">⊕</div>
                        {uploading && activeSlot === i ? 'Uploading...' : 'ADD A PHOTO'}
                      </div>
                    </label>
                  )}
                </div>
              </div>
            ))}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        ),
        // Three photo layout (2 top, 1 bottom)
        () => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrls[i] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImageUrls[i]!}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          width={500}
                          height={300}
                        />
                        <button
                          className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          onClick={() => setActiveSlot(i)}
                        />
                        <div className={uploading ? 'opacity-50' : ''}>
                          <div className="text-lg mb-1">⊕</div>
                          {uploading && activeSlot === i ? 'Uploading...' : 'ADD A PHOTO'}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrls[2] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImageUrls[2]!}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(2)}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={() => setActiveSlot(2)}
                    />
                    <div className={uploading ? 'opacity-50' : ''}>
                      <div className="text-lg mb-1">⊕</div>
                      {uploading && activeSlot === 2 ? 'Uploading...' : 'ADD A PHOTO'}
                    </div>
                  </label>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        ),
        // Three photo layout (1 top, 2 bottom)
        () => (
          <div className="space-y-2">
            <div
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrls[0] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImageUrls[0]!}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(0)}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={() => setActiveSlot(0)}
                    />
                    <div className={uploading ? 'opacity-50' : ''}>
                      <div className="text-lg mb-1">⊕</div>
                      {uploading && activeSlot === 0 ? 'Uploading...' : 'ADD A PHOTO'}
                    </div>
                  </label>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrls[i + 1] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImageUrls[i + 1]!}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          width={500}
                          height={300}
                        />
                        <button
                          className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                          onClick={() => handleRemoveImage(i + 1)}
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          onClick={() => setActiveSlot(i + 1)}
                        />
                        <div className={uploading ? 'opacity-50' : ''}>
                          <div className="text-lg mb-1">⊕</div>
                          {uploading && activeSlot === i + 1 ? 'Uploading...' : 'ADD A PHOTO'}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        ),
        // Four photo layout (2x2 grid)
        () => (
          <div className="grid grid-rows-2 gap-2">
            {[...Array(2)].map((_, row) => (
              <div key={row} className="grid grid-cols-2 gap-2">
                {[...Array(2)].map((_, col) => {
                  const index = row * 2 + col;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                    >
                      <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                      <div className="relative z-10 text-center">
                        {uploadedImageUrls[index] ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={uploadedImageUrls[index]!}
                              alt="Uploaded"
                              className="w-full h-full object-cover"
                              width={500}
                              height={300}
                            />
                            <button
                              className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                              onClick={() => handleRemoveImage(index)}
                              title="Remove image"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={uploading}
                              onClick={() => setActiveSlot(index)}
                            />
                            <div className={uploading ? 'opacity-50' : ''}>
                              <div className="text-lg mb-1">⊕</div>
                              {uploading && activeSlot === index ? 'Uploading...' : 'ADD A PHOTO'}
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        ),
      ],
    },
    {
      title: 'Message with Photos',
      layouts: [
        // Message on top, photo below
        () => (
          <>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
            <div
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrls[0] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImageUrls[0]!}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(0)}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={() => setActiveSlot(0)}
                    />
                    <div className={uploading ? 'opacity-50' : ''}>
                      <div className="text-lg mb-1">⊕</div>
                      {uploading && activeSlot === 0 ? 'Uploading...' : 'ADD A PHOTO'}
                    </div>
                  </label>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </>
        ),
        // Photo on top, message below
        () => (
          <>
            <div
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer mb-4"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrls[0] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImageUrls[0]!}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(0)}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={() => setActiveSlot(0)}
                    />
                    <div className={uploading ? 'opacity-50' : ''}>
                      <div className="text-lg mb-1">⊕</div>
                      {uploading && activeSlot === 0 ? 'Uploading...' : 'ADD A PHOTO'}
                    </div>
                  </label>
                )}
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </>
        ),
        // Two photos on top, message below
        () => (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrls[i] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImageUrls[i]!}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          width={500}
                          height={300}
                        />
                        <button
                          className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          onClick={() => setActiveSlot(i)}
                        />
                        <div className={uploading ? 'opacity-50' : ''}>
                          <div className="text-lg mb-1">⊕</div>
                          {uploading && activeSlot === i ? 'Uploading...' : 'ADD A PHOTO'}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </>
        ),
        // Message on top, two photos below
        () => (
          <>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrls[i] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImageUrls[i]!}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          width={500}
                          height={300}
                        />
                        <button
                          className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          onClick={() => setActiveSlot(i)}
                        />
                        <div className={uploading ? 'opacity-50' : ''}>
                          <div className="text-lg mb-1">⊕</div>
                          {uploading && activeSlot === i ? 'Uploading...' : 'ADD A PHOTO'}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </>
        ),
        // Message with photo to the side
        () => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {signature}
                <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                  ✎
                </button>
              </div>
              {editingMessage ? (
                <MessageEditor
                  message={message}
                  setMessage={setMessage}
                  setEditingMessage={setEditingMessage}
                />
              ) : (
                <div
                  className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setEditingMessage(true)}
                >
                  {message ? (
                    <div className="text-gray-800">
                      <p>{message}</p>
                      <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <div className="text-lg mb-1">⊕</div>
                      ADD TEXT
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrls[0] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImageUrls[0]!}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(0)}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={() => setActiveSlot(0)}
                    />
                    <div className={uploading ? 'opacity-50' : ''}>
                      <div className="text-lg mb-1">⊕</div>
                      {uploading && activeSlot === 0 ? 'Uploading...' : 'ADD A PHOTO'}
                    </div>
                  </label>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2 col-span-2">{error}</div>}
          </div>
        ),
      ],
    },
  ];

  const getSelectedLayoutComponent = () => {
    if (selectedLayout === null) return layoutCategories[0].layouts[0];

    const categoryIndex = Math.floor(selectedLayout / 10);
    const layoutIndex = selectedLayout % 10;

    if (categoryIndex >= 0 && categoryIndex < layoutCategories.length) {
      const category = layoutCategories[categoryIndex];
      if (layoutIndex >= 0 && layoutIndex < category.layouts.length) {
        return category.layouts[layoutIndex];
      }
    }

    return layoutCategories[0].layouts[0];
  };

  const SelectedLayoutComponent = getSelectedLayoutComponent();

  if (!projectData) return <p className="p-10">Loading project...</p>;

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
              <p className="text-gray-700 text-lg mb-4">{projectData.eventDescription}</p>
              <div className="mt-6 space-x-4">
                <button className="bg-white border text-purple-600 rounded-xs px-4 py-2 hover:shadow">
                  How it Works
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xs hover:bg-purple-700">
                  Contribute
                </button>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              {projectData.imageKey && (
                <Image
                  src={getImageUrl(projectData.imageKey) ?? ''}
                  alt="Event"
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              )}
            </div>
          </section>

          <section className="mb-16 mt-6">
            <h2 className="text-4xl font-bold mb-7">Contribute</h2>
            <ol className="text-gray-700 list-decimal list-inside mb-6">
              <li>
                Click <strong>Add Text</strong> in the layout below to add a memory you have of John.
              </li>
              <li>
                Click <strong>Add a Photo</strong> to add a photo of you and John.
              </li>
            </ol>

            <div
              id="contributesection"
              className="border rounded-xl bg-white shadow-md px-6 py-4 w-full max-w-md mx-auto"
            >
              {SelectedLayoutComponent()}
              <div className="mt-4 flex justify-between text-sm text-purple-600 underline">
                <button
                  onClick={() => setShowLayoutModal(true)}
                  className="text-purple-600 underline text-sm"
                >
                  View other layouts
                </button>
                <button>Add another page</button>
              </div>
            </div>
            <div className="mt-6 text-right">
              <Button className="bg-primary hover:bg-purple-700">Next</Button>
            </div>
          </section>
          <ChatSupportButton title="Chat with Support" />
        </div>
      </div>

      <LayoutPickerModal
        open={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        onSelect={(layoutId: number) => {
          setSelectedLayout(layoutId);
          setShowLayoutModal(false);
        }}
        selectedLayout={selectedLayout}
      />
    </div>
  );
}