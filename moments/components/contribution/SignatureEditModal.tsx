'use client';

import { useState } from "react";


// Interface Definitions
export interface Page {
  layout: number;
  images: (string | null)[];
  message: string;
}

export interface ProjectData {
  projectName: string;
  eventDescription?: string;
  imageKey?: string;
}

// Signature Edit Modal Component
export const SignatureEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  signature: string;
  setSignature: (value: string) => void;
}> = ({ isOpen, onClose, signature, setSignature }) => {
  const [tempSignature, setTempSignature] = useState(signature);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Signature</h2>
        <input
          type="text"
          value={tempSignature}
          onChange={(e) => setTempSignature(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          placeholder="Enter your name"
        />
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
            onClick={() => {
              setSignature(tempSignature);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};