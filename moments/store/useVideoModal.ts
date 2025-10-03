import { create } from "zustand";

interface VideoModalState {
  isOpen: boolean;
  videoSrc: string; 
  openModal: (src: string) => void;
  closeModal: () => void;
}

export const useVideoModalStore = create<VideoModalState>((set) => ({
  isOpen: false,
  videoSrc: "https://pub-e59ed743ceb3452ea4c0987a8c6bd376.r2.dev/VN20250623_233347.mp4",
 
  openModal: (src) => set({ isOpen: true, videoSrc: src }),
  
  closeModal: () => set({ isOpen: false, videoSrc: "" }),
}));