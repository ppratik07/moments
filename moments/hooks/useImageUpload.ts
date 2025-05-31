// hooks/useImageUpload.ts

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { HTTP_BACKEND } from "@/utils/config";

interface UseImageUploadOptions {
  onSuccess: (key: string, file: File) => void;
  uploadEndpoint?: string;
  projectId: string;
}

export function useImageUpload({
  onSuccess,
  projectId,
  uploadEndpoint = `${HTTP_BACKEND}/api/get-presign-url`,
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      const res = await axios.get(uploadEndpoint, {
        params: {
          fileType: file.type,
        },
      });

      const { uploadUrl, key } = res.data;
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
       await axios.patch(`${HTTP_BACKEND}/api/users/${projectId}/upload-image`, {
        imageKey: key,
        uploadUrl: uploadUrl,
      });
      onSuccess(key, file);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return {
    handleImageChange,
    uploading,
    preview,
    setPreview,
  };
}
