import React from 'react';
import { UserPlus, Image, Calendar } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="text-primary h-10 w-10" />,
      title: "Invite Contributors",
      description: "Start your project and invite friends and family to add their memories and photos.",
      highlight: "Easy sharing via email or link"
    },
    {
      icon: <Image className="text-primary h-10 w-10" />,
      title: "Collect Memories",
      description: "Everyone adds their special photos and messages to create a collaborative memory book.",
      highlight: "No account needed for contributors"
    },
    {
      icon: <Calendar className="text-primary h-10 w-10" />,
      title: "Print & Deliver",
      description: "Review the layout, arrange pages, and order your professionally printed memory book.",
      highlight: "Premium quality and fast shipping"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 fade-in-up">How It Works</h2>
          <p className="text-lg text-muted-foreground fade-in-up stagger-1">
            Creating a collaborative memory book is simple with our easy three-step process
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-primary to-accent" />
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-border relative z-10 
                       hover:shadow-md transition-shadow fade-in-up"
              style={{ animationDelay: `${0.2 * (index + 1)}s` }}
            >
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                {step.icon}
              </div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-center mb-4">{step.description}</p>
              <p className="text-xs font-medium text-primary text-center">{step.highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;