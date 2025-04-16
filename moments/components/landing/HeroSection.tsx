import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, UserPlus, Gift } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent to-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <p className="text-secondary flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW Collaborative Memory Books</span>
                <span className="text-sm">Collaborative Memory Books</span>
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight fade-in-up">
              Create Beautiful <span className="text-gradient">Memory Books</span> Together
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground fade-in-up stagger-1">
              Collect memories, photos, and messages from friends and family to create a 
              meaningful keepsake for life&apos;s special moments.
            </p>
            <div className="flex flex-wrap gap-4 fade-in-up stagger-2">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Start Your Book
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                See Examples
              </Button>
            </div>
            <div className="pt-4 fade-in-up stagger-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>✓ No design skills needed</span>
                <span className="mx-2">•</span>
                <span>✓ Easy to share</span>
                <span className="mx-2">•</span>
                <span>✓ Premium quality prints</span>
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 relative fade-in stagger-2">
            <div className="relative bg-white shadow-xl rounded-2xl p-4 rotate-3 hover-lift">
              <Image
                src="https://images.unsplash.com/photo-1731596153022-4cedafe3330a?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Memory Book Example"
                className="w-full h-auto object-cover"
                width={500}
                height={500}
              />
              <div className="absolute -bottom-5 -left-5 bg-white p-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <UserPlus size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">15 contributors</p>
                    <p className="text-xs text-muted-foreground">Retirement gift</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white p-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">32 pages</p>
                    <p className="text-xs text-muted-foreground">Photos & messages</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-4 rounded-xl shadow-lg rotate-6 hover-lift z-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Gift size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Perfect for special occasions</p>
                  <p className="text-xs text-muted-foreground">Birthdays, Weddings, Retirement & more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;