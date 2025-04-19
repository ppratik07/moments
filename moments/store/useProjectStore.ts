import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectState = {
  projectName: string;
  imageKey: string;
  eventType : string | null;
  eventDescription : string | null;
  projectId : string | null;
  setProjectName: (name: string) => void;
  setImageKey: (key: string) => void;
  setEventType: (type: string) => void;
  setEventDescription: (description: string) => void; 
  setProjectId:(id: string) => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projectName: "",
      imageKey: "",
      eventType: null,
      eventDescription: null,
      projectId : null,
      setProjectName: (name) => set({ projectName: name }),
      setImageKey: (key) => set({ imageKey: key }),
      setEventType: (type) => set({ eventType: type }),
      setEventDescription: (description) => set({ eventDescription: description }),
      setProjectId: (id) => set({ projectId: id }),
    }),
    {
      name: "project-storage", //  name for local-storage key
    }
  )
)

