import { create } from "zustand";

type ProjectState = {
  projectName: string;
  setProjectName: (name: string) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: "",
  setProjectName: (name) => set({ projectName: name }),
}));
