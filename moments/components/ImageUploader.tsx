'use client';

import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useImageUpload } from '@/hooks/useImageUpload'; 

interface ImageUploaderProps {
  onUploadSuccess: (key: string) => void;
  initialPreview?: string | null;
  label?: string;
  uploadEndpoint?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  initialPreview = null,
  label = 'Add a Photo',
  uploadEndpoint,
}: ImageUploaderProps) {
  const { handleImageChange, uploading, preview, setPreview } = useImageUpload({
    onSuccess: (key: string) => onUploadSuccess(key),
    uploadEndpoint,
  });

  // Set initial preview if provided
  if (initialPreview && !preview) {
    setPreview(initialPreview);
  }

  return (
    <label
      htmlFor="photo"
      className="w-full h-64 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 cursor-pointer rounded-lg mb-6 hover:border-blue-500 transition relative"
    >
      {preview ? (
        <Image src={preview} alt="Preview" fill className="object-cover rounded-lg" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <PlusCircle className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium">{uploading ? 'Uploading...' : label}</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        id="photo"
        onChange={handleImageChange}
        className="hidden"
      />
    </label>
  );
}
