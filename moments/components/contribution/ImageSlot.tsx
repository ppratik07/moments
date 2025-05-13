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
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  image,
  index,
  pageIndex,
  uploading,
  handleFileUpload,
  handleRemoveImage,
}) => (
  <div className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer">
    <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
    <div className="relative z-10 text-center">
      {image ? (
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
            width={500}
            height={300}
          />
          <button
            className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
            onClick={() => handleRemoveImage(pageIndex, index)}
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
            onChange={(e) => handleFileUpload(e, pageIndex, index)}
            disabled={uploading}
          />
          <div className={uploading ? 'opacity-50' : ''}>
            <div className="text-lg mb-1">⊕</div>
            {uploading ? <RotatingLines
              visible={true}
              strokeColor="gray"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              ariaLabel="rotating-lines-loading"
            /> : 'ADD A PHOTO'}
          </div>
        </label>
      )}
    </div>
  </div>
);