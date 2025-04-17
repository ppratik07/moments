'use client';

import { useState } from 'react';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ChatSupportButton from '@/components/ChatSupportButton';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { HTTP_BACKEND } from '@/utils/config';

export default function AddPhoto() {
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { isSignedIn } = useCurrentUser();
    const router = useRouter();
    const { projectName,imageKey } = useProjectStore();
    // const handleNext = () => {
    //     if (!projectName) {
    //         console.log('No project name set!');
    //         return;
    //     }
    //     router.push(`/new-project/upload-image/${projectName}`);
    // };
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    
        setUploading(true);
    
        try {
          //  Getting pre-signed URL
          const res = await axios.get(`${HTTP_BACKEND}/api/get-presign-url`, {
            params: {
              fileType: file.type,
            },
          });
    
          const { uploadUrl, key } = res.data;
    
        // Upload file to R2 using presigned URL
          try {
            await axios.put(uploadUrl, file, {
              headers: {
                'Content-Type': file.type,
              },
            });
            console.log('Upload successful!');
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error('Axios error:', error.response?.data, error.response?.status);
            } else {
              console.error('Unknown error:', error);
            }
          }
    
          //  Save uploaded key to zustand store
          useProjectStore.getState().setImageKey(key);
    
          console.log('Uploaded to S3 at:', key);
        } catch (err) {
          console.error('Upload failed:', err);
        } finally {
          setUploading(false);
        }
      };

    return (
        <div>
            <Header isSignedIn={isSignedIn ?? false} />
            <div className="min-h-screen bg-white flex flex-col items-center px-4 py-12">
                <div className="w-full max-w-2xl">

                    <div className="mb-10">
                        <h1 className="text-2xl font-bold mb-2">Add a Photo</h1>
                        <p className="text-muted-foreground">
                            Add a photo of who the book is for. It helps contributors connect better.
                        </p>
                    </div>

                    <label
                        htmlFor="photo"
                        className="w-full h-64 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 cursor-pointer rounded-lg mb-6 hover:border-blue-500 transition relative"
                    >
                        {preview ? (
                            <Image src={preview} alt="Preview" fill className="object-cover rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <PlusCircle className="w-8 h-8 text-gray-400" />
                                <span className="text-sm font-medium">
                                    {uploading ? 'Uploading...' : 'Add a Photo'}
                                </span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            id="photo"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                    <div className="flex justify-center mt-6">
                        <Button
                            disabled={uploading}
                            // onClick={handleNext}
                            className="bg-primary hover:bg-primary/90 justify-center cursor-pointer"
                        >
                            Next
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between mt-48 gap-4">
                        <ChatSupportButton title='Chat with Support' />
                        {/* <div className='bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 hidden'>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>

    );
}
