// components/layouts/types.ts
export interface MessageEditorProps {
    message: string;
    setMessage: (message: string) => void;
    setEditingMessage: (editing: boolean) => void;
  }
  
  export interface LayoutProps {
    signature: string;
    setIsModalOpen: (open: boolean) => void;
    message: string;
    editingMessage: boolean;
    setEditingMessage: (editing: boolean) => void;
    setMessage: (message: string) => void;
    uploadedImageUrl: string | null;
    setShowUploader: (show: boolean) => void;
  }
  