import { useState, useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string; // e.g. https://pub-...r2.dev/yourfile.mp4
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      // Animate out before unmount
      setTimeout(() => setShowModal(false), 300);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-lg relative transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} duration-500 ease-in-out`}
        style={{ width: '800px', height: '400px' }}
      >
        <button
          className="absolute top-2 right-3 text-2xl text-black z-10"
          onClick={onClose}
        >
          ❌
        </button>
        <div className="relative w-full h-full">
          <video
            src={videoSrc}
            controls
            className="absolute top-0 left-0 w-full h-full rounded-lg object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
