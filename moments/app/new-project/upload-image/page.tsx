'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ChatSupportButton from '@/components/ChatSupportButton';

export default function AddPhoto() {
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { isSignedIn } = useCurrentUser();
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        setUploading(true);

        try {
            // Get pre-signed URL
            const res = await fetch(`/api/upload-url?fileType=${encodeURIComponent(file.type)}`);
            const { uploadUrl, key } = await res.json();

            // Upload to S3
            await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

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
