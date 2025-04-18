'use client';

import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { HTTP_BACKEND } from '@/utils/config';

interface ImageUploaderProps {
  onUploadSuccess: (key: string) => void;
  initialPreview?: string | null;
  label?: string;
  uploadEndpoint?: string; // defaults to `/api/get-presign-url`
}

export default function ImageUploader({
  onUploadSuccess,
  initialPreview = null,
  label = 'Add a Photo',
  uploadEndpoint = `${HTTP_BACKEND}/api/get-presign-url`,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      const res = await axios.get(uploadEndpoint, {
        params: {
          fileType: file.type,
        },
      });

      const { uploadUrl, key } = res.data;

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      onUploadSuccess(key);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
