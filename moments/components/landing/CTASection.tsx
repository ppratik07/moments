import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CTASection = () => {
  const router  = useRouter();
  return (
    <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 mb-6">
            <Gift className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Create something meaningful</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Your Collaborative Memory Book Today
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create a beautiful keepsake filled with memories and messages from the people who matter most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 cursor-pointer" onClick={()=> router.push('/new-project')}>
              <BookOpen className="mr-2 h-5 w-5" /> Start Your Memory Book
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 cursor-pointer">
              View Example Books
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required to start • Simple to use • Download PDF by minimal payment
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;