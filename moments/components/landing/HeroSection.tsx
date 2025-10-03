import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, UserPlus, Gift } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent to-background py-16 md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* LEFT TEXT SECTION */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-block w-auto mx-auto lg:mx-0 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <p className="text-secondary flex flex-col md:flex-row items-center gap-2">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW Collaborative Memory Books
                </span>
                <span className="text-sm">Collaborative Memory Books</span>
              </p>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight fade-in-up">
              Create Beautiful <span className="text-gradient">Memory Books</span> Together
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground fade-in-up stagger-1 max-w-lg mx-auto lg:mx-0">
              Collect memories, photos, and messages from friends and family to create a 
              meaningful keepsake for life&apos;s special moments.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 fade-in-up stagger-2">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full sm:w-auto"
                onClick={() => router.push('/new-project')}
              >
                Start Your Book
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 cursor-pointer w-full sm:w-auto"
              >
                See Examples
              </Button>
            </div>

            {/* Features */}
            <div className="pt-4 fade-in-up stagger-3">
              <p className="text-sm text-muted-foreground flex flex-wrap justify-center lg:justify-start gap-2">
                <span>✓ No design skills needed</span>
                <span>•</span>
                <span>✓ Easy to share</span>
                <span>•</span>
                <span>✓ Download PDF at minimal cost</span>
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE SECTION */}
          <div className="lg:w-1/2 relative fade-in stagger-2">
            <div className="relative bg-white shadow-xl rounded-2xl p-4 rotate-3 hover-lift max-w-xs sm:max-w-md mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1731596153022-4cedafe3330a?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Memory Book Example"
                className="w-full h-auto object-cover rounded-xl"
                width={500}
                height={500}
              />
              
              {/* Contributors badge */}
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

              {/* Pages badge */}
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

            {/* Gift badge */}
            <div className="absolute -bottom-10 -right-5 sm:-right-10 bg-white p-4 rounded-xl shadow-lg rotate-6 hover-lift z-10 w-72 max-w-full mx-auto">
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
