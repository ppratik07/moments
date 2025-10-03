"use client"

import { useState, useEffect } from 'react';

import { useVideoModalStore } from "@/store/useVideoModal"; 

export default function VideoModal() {
  const { isOpen, closeModal } = useVideoModalStore();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
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
          onClick={closeModal} 
        >
          ❌
        </button>
        <div className="relative w-full h-full">
          <video
            src="https://pub-e59ed743ceb3452ea4c0987a8c6bd376.r2.dev/VN20250623_233347.mp4"
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