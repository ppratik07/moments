// store/useVideoModalStore.ts

import { create } from "zustand";

interface VideoModalState {
  isOpen: boolean;
  videoSrc: string; // To hold the URL of the video to play
  openModal: (src: string) => void;
  closeModal: () => void;
}

export const useVideoModalStore = create<VideoModalState>((set) => ({
  isOpen: false,
  videoSrc: "",
  // Opens the modal and sets the video source
  openModal: (src) => set({ isOpen: true, videoSrc: src }),
  // Closes the modal and clears the source
  closeModal: () => set({ isOpen: false, videoSrc: "" }),
}));