import { create } from "zustand";

type ProjectState = {
  projectName: string;
  imageKey: string;
  setProjectName: (name: string) => void;
  setImageKey: (key: string) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: "",
  imageKey : '',
  setProjectName: (name) => set({ projectName: name }),
  setImageKey : (key) => set({imageKey : key}),
}));
