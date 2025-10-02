import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "The collaborative memory book we made for my mom's 60th birthday brought her to tears. Everyone loved being able to contribute their own special memories.",
      author: "Sarah J.",
      occasion: "60th Birthday Gift",
      stars: 5
    },
    {
      quote: "We created a memory book for our colleague who was retiring after 25 years. The process was so easy, and the quality of the final book exceeded our expectations.",
      author: "Michael T.",
      occasion: "Retirement Gift",
      stars: 5
    },
    {
      quote: "I was worried about getting everyone to contribute, but the sharing system made it so simple. We collected over 40 pages of memories for our friend's wedding anniversary.",
      author: "Priya K.",
      occasion: "Anniversary Gift",
      stars: 5
    }
  ];

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground">
            See why thousands of people choose our platform for their special memory books
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-border flex flex-col h-full fade-in-up hover-lift dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="flex mb-4">
                {Array(testimonial.stars).fill(0).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-lg mb-6 flex-grow">{testimonial.quote}</blockquote>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.occasion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;