'use client';

import Image from "next/image";
import { RotatingLines } from "react-loader-spinner";

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
  handleFileDrop?: (file: File, pageIndex: number, slotIndex: number) => void;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  image,
  index,
  pageIndex,
  uploading,
  handleFileUpload,
  handleRemoveImage,
  handleFileDrop,
}) => (
  <div
    className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-xs sm:text-sm cursor-pointer w-full border border-dashed"
    onDragOver={(e) => {
      if (handleFileDrop && !image) {
        e.preventDefault();
        e.currentTarget.classList.add('border-blue-500');
      }
    }}
    onDragLeave={(e) => {
      e.currentTarget.classList.remove('border-blue-500');
    }}
    onDrop={(e) => {
      if (!handleFileDrop || image) return;
      e.preventDefault();
      e.currentTarget.classList.remove('border-blue-500');
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFileDrop(file, pageIndex, index);
      }
    }}
  >
    <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
    <div className="relative z-10 text-center">
      {image ? (
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
            width={300}
            height={200}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <button
            className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gray-800 text-white rounded-full p-1 sm:p-1.5"
            onClick={() => handleRemoveImage(pageIndex, index)}
            title="Remove image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-2.5 w-2.5 sm:h-3 sm:w-3"
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
            onChange={(e) => handleFileUpload(e, pageIndex, index)}
            disabled={uploading}
          />
          <div className={uploading ? 'opacity-50' : ''}>
            <div className="text-base sm:text-lg mb-1 sm:mb-2">⊕</div>
            {uploading ? (
              <RotatingLines
                visible={true}
                strokeColor="gray"
                strokeWidth="5"
                animationDuration="0.75"
                width="48"
                ariaLabel="rotating-lines-loading"
              />
            ) : (
              <span className="text-xs sm:text-sm">ADD A PHOTO or DROP HERE</span>
            )}
          </div>
        </label>
      )}
    </div>
  </div>
);