'use client';

import { X } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';

interface HeadsUpModalProps {
  visible: boolean;
  onClose: () => void;
  enteredDate: string | null;
  calculatedDate: Date | null;
}

export const HeadsUpModal: React.FC<HeadsUpModalProps> = ({ visible, onClose, calculatedDate }) => {
  if (!visible || !calculatedDate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
          📣 Heads-Up!
        </h2>

        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
          The physical version of your book may not be ready by <strong>{calculatedDate.toLocaleDateString()}</strong> because it typically takes several weeks to gather contributions from all your friends and print and ship the book.
        </p>

        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
          But the digital (online) version will be available as soon as you order the physical book. So, as soon as you’ve finished gathering contributions and ordered your book, you will have access to the digital version of the book. You can share this with anyone while you wait for the physical version to print and ship.
        </p>

        <p className="text-gray-700 text-sm leading-relaxed">
          The digital version of the book looks and acts just like a regular book. It has a cover and you can flip through the pages just like a physical book.
        </p>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </div>
    </div>
  );
};
