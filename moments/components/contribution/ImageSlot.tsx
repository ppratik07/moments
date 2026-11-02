'use client';

import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { RotatingLines } from 'react-loader-spinner';
import { cn } from '@/lib/utils';

interface ImageSlotProps {
  image: string | null;
  index: number;
  pageIndex: number;
  uploading: boolean;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    pageIndex: number,
    slotIndex: number
  ) => void;
  handleRemoveImage: (pageIndex: number, slotIndex: number) => void;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  image,
  index,
  pageIndex,
  uploading,
  handleFileUpload,
  handleRemoveImage,
}) => (
  <div
    className={cn(
      'relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl transition-all',
      image
        ? 'ring-1 ring-black/5 shadow-sm'
        : 'border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]/80 hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-surface-container-low)]'
    )}
  >
    {image ? (
      <div className="relative h-full w-full">
        <Image
          src={image}
          alt="Uploaded"
          className="h-full w-full object-cover"
          width={300}
          height={200}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          onClick={() => handleRemoveImage(pageIndex, index)}
          title="Remove image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ) : (
      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-2 text-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, pageIndex, index)}
          disabled={uploading}
        />
        <div className={cn('flex flex-col items-center', uploading && 'opacity-50')}>
          {uploading ? (
            <RotatingLines
              visible={true}
              strokeColor="var(--color-primary)"
              strokeWidth="5"
              animationDuration="0.75"
              width="40"
              ariaLabel="Uploading"
            />
          ) : (
            <>
              <ImagePlus className="mb-2 h-7 w-7 text-[var(--color-primary)]/75" strokeWidth={1.5} aria-hidden />
              <span className="font-label-lg text-[var(--color-on-surface-variant)]">Add a photo</span>
            </>
          )}
        </div>
      </label>
    )}
  </div>
);
