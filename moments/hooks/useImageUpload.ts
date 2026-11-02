import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { HTTP_BACKEND } from "@/utils/config";

interface UseImageUploadOptions {
  onSuccess: (key: string, file: File) => void;
  projectId: string | null;
  getAuthToken?: () => Promise<string | null>;
}

function resolveFileType(file: File): string {
  if (file.type?.startsWith("image/")) {
    return file.type.split(";")[0].trim();
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
  };
  return (ext && byExt[ext]) || "image/jpeg";
}

export function useImageUpload({
  onSuccess,
  projectId,
  getAuthToken,
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!projectId?.trim()) {
      toast.error("Project not found. Please create your project again from step 1.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    const contentType = resolveFileType(file);

    try {
      const token = getAuthToken ? await getAuthToken() : null;
      if (!token) {
        toast.error("Please sign in again to upload photos.");
        setPreview(null);
        return;
      }

      const response = await axios.post(
        `${HTTP_BACKEND}/api/users/${projectId}/upload-cover`,
        file,
        {
          headers: {
            "Content-Type": contentType,
            Authorization: `Bearer ${token}`,
          },
          maxBodyLength: 12 * 1024 * 1024,
          maxContentLength: 12 * 1024 * 1024,
        }
      );

      const key = response.data?.key as string | undefined;
      if (!key) {
        throw new Error("Upload response missing image key");
      }

      onSuccess(key, file);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { error?: string })?.error ||
          err.message ||
          "Upload failed. Please try again.";
        toast.error(message);
      } else {
        toast.error("Upload failed. Please try again.");
      }
      setPreview(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return {
    handleImageChange,
    uploading,
    preview,
    setPreview,
  };
}
