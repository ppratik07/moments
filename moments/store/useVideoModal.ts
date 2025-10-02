import { create } from "zustand";

interface VideoModalState {
  isOpen: boolean;
  videoSrc: string; 
  openModal: (src: string) => void;
  closeModal: () => void;
}

export const useVideoModalStore = create<VideoModalState>((set) => ({
  isOpen: false,
  videoSrc: "",
 
  openModal: (src) => set({ isOpen: true, videoSrc: src }),
  
  closeModal: () => set({ isOpen: false, videoSrc: "" }),
}));