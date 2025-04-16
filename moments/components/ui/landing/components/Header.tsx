'use client';
import { BookOpen, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../button";

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);
    return (
        <div>
            <header className="bg-gradient-to-b from-accent to-background sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">MemoryLane</span>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
                            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
                            <a href="#occasions" className="text-sm font-medium hover:text-primary transition-colors">Occasions</a>
                            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                Log In
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90">
                                Get Started
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white md:hidden">
                    <div className="flex flex-col p-6 space-y-6 text-center pt-20">
                        <a
                            href="#how-it-works"
                            className="text-lg font-medium py-2 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            How It Works
                        </a>
                        <a
                            href="#features"
                            className="text-lg font-medium py-2 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#occasions"
                            className="text-lg font-medium py-2 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Occasions
                        </a>
                        <a
                            href="#testimonials"
                            className="text-lg font-medium py-2 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Testimonials
                        </a>
                        <div className="flex flex-col space-y-4 pt-4">
                            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                                Log In
                            </Button>
                            <Button className="w-full bg-primary hover:bg-primary/90">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}