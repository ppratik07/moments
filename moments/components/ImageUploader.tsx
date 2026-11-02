'use client';

import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onUploadSuccess: (key: string) => void;
  initialPreview?: string | null;
  label?: string;
  variant?: 'default' | 'studio';
}

export default function ImageUploader({
  onUploadSuccess,
  initialPreview = null,
  label = 'Add a Photo',
  variant = 'default',
}: ImageUploaderProps) {
  const projectId = useProjectStore((state) => state.projectId);
  const { getToken } = useAuth();
  const { handleImageChange, uploading, preview, setPreview } = useImageUpload({
    onSuccess: (key: string) => onUploadSuccess(key),
    projectId,
    getAuthToken: () => getToken(),
  });

  if (initialPreview && !preview) {
    setPreview(initialPreview);
  }

  const isStudio = variant === 'studio';

  return (
    <label
      htmlFor="photo"
      className={cn(
        'w-full flex items-center justify-center cursor-pointer relative overflow-hidden transition-colors',
        isStudio
          ? 'h-[320px] sm:h-[380px] rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container)]'
          : 'h-[400px] border border-dashed border-gray-300 text-gray-500 mb-6 hover:border-blue-500'
      )}
    >
      {preview ? (
        <Image src={preview} alt="Preview" fill className="object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              isStudio ? 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)]' : 'text-gray-400'
            )}
          >
            <PlusCircle className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <span className={cn('text-sm font-medium', isStudio && 'font-label-lg text-[var(--color-on-surface-variant)]')}>
            {uploading ? 'Uploading…' : label}
          </span>
        </div>
      )}
      <input type="file" accept="image/*" id="photo" onChange={handleImageChange} className="hidden" />
    </label>
  );
}
