import { useState, useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      // Trigger slide out animation before actually hiding the modal
      setTimeout(() => setShowModal(false), 300); // 300ms to match the transition duration
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-lg relative transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} duration-500 ease-in-out`}
        style={{
          width: '800px', // Fixed width
          height: '400px', // Fixed height 
        }}
      >
        <button
          className="absolute top-1 right-1 text-xl z-1 text-black"
          onClick={onClose}
        >
          ❌
        </button>
        <div className="relative w-full h-full">
          <iframe
            src={videoSrc}
            frameBorder="0"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            title="How It Works Video"
          />
        </div>
      </div>
    </div>
  );
}