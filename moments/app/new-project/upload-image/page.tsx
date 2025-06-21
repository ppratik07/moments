'use client';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
// import ChatSupportButton from '@/components/ChatSupportButton';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';

export default function AddPhoto() {
    const { isSignedIn } = useCurrentUser();
    const router = useRouter();
    const { projectName, imageKey } = useProjectStore();

    const handleNext = () => {
        if (!projectName) {
            toast.error('No project name set!');
            return;
        }
        if (!imageKey) {
            toast.error('Please upload image first');
            return;
        }
        router.push(`/new-project/upload-image/${projectName}`);
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

                    <ImageUploader
                        onUploadSuccess={(key) => useProjectStore.getState().setImageKey(key)}
                        label="Add a Photo"
                    />

                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={handleNext}
                            className="bg-primary hover:bg-primary/90 justify-center cursor-pointer"
                        >
                            Next
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between mt-48 gap-4">
                        {/* <ChatSupportButton title="Chat with Support" /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
