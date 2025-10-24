import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Occasion {
  id: string;
  title: string;
  image: string;
  description: string;
  detailedDescription: string;
  benefits: string[];
  examples: string[];
}

const Occasions = () => {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const occasions: Occasion[] = [
    {
      id: "milestone-birthdays",
      title: "Milestone Birthdays",
      image: "https://images.unsplash.com/photo-1706696628425-07811fc5d6f0?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Create a special gift for 30th, 40th, 50th, 60th birthdays and beyond.",
      detailedDescription: "Milestone birthdays are momentous occasions that deserve to be celebrated in a truly special way. These significant life markers - whether it's turning 30, 40, 50, 60, or beyond - represent not just another year, but entire chapters of memories, achievements, and relationships that have shaped someone's journey.",
      benefits: [
        "Capture decades of memories in one beautiful keepsake",
        "Involve friends and family from all stages of life",
        "Create a meaningful alternative to traditional gifts",
        "Preserve stories and photos that might otherwise be forgotten"
      ],
      examples: [
        "50th birthday book with photos from childhood, college, career milestones",
        "60th birthday collection featuring messages from grandchildren",
        "30th birthday memories from school friends, work colleagues, and family"
      ]
    },
    {
      id: "retirement-celebrations",
      title: "Retirement Celebrations",
      image: "https://images.unsplash.com/photo-1702944334266-de048195f995?q=80&w=3019&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Collect memories and well wishes from colleagues for a meaningful retirement gift.",
      detailedDescription: "Retirement marks the end of a significant career chapter and the beginning of an exciting new phase of life. After years or decades of dedicated service, colleagues, clients, and friends have countless stories, appreciations, and well-wishes to share. A collaborative memory book becomes the perfect tribute to honor their professional journey and personal relationships.",
      benefits: [
        "Honor years of professional dedication and achievement",
        "Collect messages from colleagues across different departments and time periods",
        "Create a lasting reminder of workplace friendships and accomplishments",
        "Provide a meaningful send-off that goes beyond a standard retirement party"
      ],
      examples: [
        "Career retrospective with photos from first day to last",
        "Messages from mentees sharing how they were inspired",
        "Funny workplace stories and memorable project celebrations"
      ]
    },
    {
      id: "wedding-anniversaries",
      title: "Wedding Anniversaries",
      image: "https://images.unsplash.com/photo-1731664452875-0d28d943beda?q=80&w=3040&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Celebrate years of love with messages from friends and family.",
      detailedDescription: "Wedding anniversaries celebrate not just the couple's love story, but the community of family and friends who have witnessed and supported their journey together. Whether it's a 10th, 25th, or 50th anniversary, these milestones represent years of shared experiences, growth, and the beautiful impact a couple has had on those around them.",
      benefits: [
        "Celebrate the couple's impact on family and friends",
        "Gather perspectives from different stages of their relationship",
        "Create a romantic keepsake that grows more precious over time",
        "Include wedding guests, children, grandchildren, and new friends"
      ],
      examples: [
        "25th anniversary book with messages from wedding party and new friends",
        "50th anniversary collection featuring children and grandchildren's perspectives",
        "10th anniversary memories from the wedding day and early marriage years"
      ]
    },
    {
      id: "going-away-gifts",
      title: "Going Away Gifts",
      image: "https://images.unsplash.com/photo-1625358775013-80c6b4282390?q=80&w=3003&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      description: "Say goodbye to friends or colleagues moving away with a collection of memories.",
      detailedDescription: "When someone special is moving away - whether for a new job, family reasons, or life adventure - it's an opportunity to create something that bridges the physical distance. A collaborative memory book becomes a tangible reminder of the relationships, experiences, and impact they've had on their community, making the transition easier and the connection lasting.",
      benefits: [
        "Create a portable piece of home for their new adventure",
        "Strengthen bonds that will continue despite distance",
        "Capture local memories and inside jokes they'll treasure",
        "Show the lasting impact they've had on their community"
      ],
      examples: [
        "Colleague moving across the country with work team memories",
        "Friend relocating with photos from local adventures and hangouts",
        "Family member moving away with neighborhood and extended family messages"
      ]
    }
  ];

  const handleLearnMore = (occasion: Occasion) => {
    setSelectedOccasion(occasion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOccasion(null);
  };

  return (
    <>
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
                key={occasion.id} 
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/30 bg-white/10 hover:bg-white/20"
                    onClick={() => handleLearnMore(occasion)}
                    aria-label={`Learn more about ${occasion.title}`}
                  >
                    Learn more <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOccasion && (
            <>
              <DialogHeader className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={selectedOccasion.image}
                    alt={selectedOccasion.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <DialogTitle className="text-2xl font-bold text-left">
                  {selectedOccasion.title}
                </DialogTitle>
                <DialogDescription className="text-base text-left leading-relaxed">
                  {selectedOccasion.detailedDescription}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-foreground">Why Choose This Occasion?</h4>
                  <ul className="space-y-2">
                    {selectedOccasion.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-foreground">Perfect For:</h4>
                  <ul className="space-y-2">
                    {selectedOccasion.examples.map((example, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span className="text-sm text-muted-foreground">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full"
                    onClick={handleCloseModal}
                  >
                    Start Creating Your Memory Book
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Occasions;