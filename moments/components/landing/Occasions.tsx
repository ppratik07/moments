import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

const Occasions = () => {
  const occasions = [
    {
      title: "Milestone Birthdays",
      image: "https://images.unsplash.com/photo-1706696628425-07811fc5d6f0?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Create a special gift for 30th, 40th, 50th, 60th birthdays and beyond."
    },
    {
      title: "Retirement Celebrations",
      image: "https://images.unsplash.com/photo-1702944334266-de048195f995?q=80&w=3019&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Collect memories and well wishes from colleagues for a meaningful retirement gift."
    },
    {
      title: "Wedding Anniversaries",
      image: "https://images.unsplash.com/photo-1731664452875-0d28d943beda?q=80&w=3040&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Celebrate years of love with messages from friends and family."
    },
    {
      title: "Going Away Gifts",
      image: "https://images.unsplash.com/photo-1625358775013-80c6b4282390?q=80&w=3003&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      description: "Say goodbye to friends or colleagues moving away with a collection of memories."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Occasion</h2>
          <p className="text-lg text-muted-foreground">
            Create meaningful memory books for all of life&apos;s special moments
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {occasions.map((occasion, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-xl hover-lift fade-in-up"
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <Image 
                src={occasion.image} 
                alt={occasion.title} 
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                width={500}
                height={500}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-semibold mb-2">{occasion.title}</h3>
                <p className="text-white/80 mb-4 text-sm max-w-md">{occasion.description}</p>
                <Button variant="outline" size="sm" className="text-white border-white/30 bg-white/10 hover:bg-white/20">
                  Learn more <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Occasions;