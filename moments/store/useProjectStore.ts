import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Layout {
  id: string;
  pageType: string;
  isPreview: boolean;
  section?: string;
  config: {
    [key: string]: unknown;
  };
}

type ProjectState = {
  projectName: string;
  imageKey: string;
  eventType : string | null;
  eventDescription : string | null;
  projectId : string | null;
  layouts: Layout[];
  setProjectName: (name: string) => void;
  setImageKey: (key: string) => void;
  setEventType: (type: string) => void;
  setEventDescription: (description: string) => void; 
  setProjectId:(id: string) => void;
  setLayouts: (layouts: Layout[]) => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projectName: "",
      imageKey: "",
      eventType: null,
      eventDescription: null,
      projectId : null,
      layouts:[],
      setProjectName: (name) => set({ projectName: name }),
      setImageKey: (key) => set({ imageKey: key }),
      setEventType: (type) => set({ eventType: type }),
      setEventDescription: (description) => set({ eventDescription: description }),
      setProjectId: (id) => set({ projectId: id }),
      setLayouts: (layouts) => set({ layouts }),
    }),
    {
      name: "project-storage", //  name for local-storage key
    }
  )
)

