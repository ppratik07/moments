'use client'
import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import {
  //Check,
  Layout,
  Users,
  // Image,
  //BookOpen,
  Calendar,
  // Settings,
  Shield
} from 'lucide-react';

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && sectionRef.current) {
          animate('.fade-in-up', {
            opacity: [0, 1],
            y: [30, 0],
            delay: stagger(100, { from: 'first' }),
            duration: 800,
            easing: 'easeOutQuint',
          });
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const featuresList = [
    {
      icon: <Layout className="h-5 w-5" />,
      title: "Multiple Layout Options",
      description: "Choose from various pre-designed layouts or create your own custom arrangement."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Unlimited Contributors",
      description: "Invite as many friends and family as you want to contribute to your memory book."
    },
    // {
    //   icon: <Image className="h-5 w-5" />,
    //   title: "Photo Enhancement",
    //   description: "Automatic photo enhancement ensures all images look their best in print."
    // },
    // {
    //   icon: <BookOpen className="h-5 w-5" />,
    //   title: "Custom Cover Options",
    //   description: "Personalize your book with custom cover designs, colors, and titles."
    // },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Occasion Templates",
      description: "Special templates designed for birthdays, weddings, retirements, and more."
    },
    // {
    //   icon: <Settings className="h-5 w-5" />,
    //   title: "Easy Editing Tools",
    //   description: "Simple editing tools make it easy to perfect each page, even for beginners."
    // },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Private & Secure",
      description: "Your memories stay private and secure with our advanced protection."
    },
    // {
    //   icon: <Check className="h-5 w-5" />,
    //   title: "Premium Print Quality",
    //   description: "Professional printing on high-quality paper for a keepsake that lasts."
    // }
  ];

  return (
    <section className="py-20 bg-accent/50" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features You&apos;ll Love</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create meaningful memory books that will be cherished for years
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feature, index) => (
            <div
              key={index}
              className="fade-in-up opacity-0 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <div className="text-primary">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
