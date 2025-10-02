import { BookOpen } from "lucide-react";

import { useVideoModalStore } from "@/store/useVideoModal"; 

export const Footer: React.FC = () => {

    const { openModal } = useVideoModalStore();
    
    // IMPORTANT: You must replace this placeholder with the actual video URL!
    
    const HOW_IT_WORKS_VIDEO_SRC = "https://pub-replace-this-with-the-real-video-url.mp4"; 

    return (
        <footer className="bg-white border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="text-lg font-bold">MemoryLane</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create beautiful collaborative memory books for life&apos;s special moments.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Features</a></li>
                            
                            {}
                            <li>
                                <button
                                    className="text-sm text-muted-foreground hover:text-primary p-0 bg-transparent border-none cursor-pointer text-left"
                                    onClick={() => openModal(HOW_IT_WORKS_VIDEO_SRC)}
                                >
                                    How It Works
                                </button>
                            </li>
                            
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Examples</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Templates</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Help Center</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} MemoryLane. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {}
                    </div>
                </div>
            </div>
        </footer>
    );
}