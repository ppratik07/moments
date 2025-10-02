'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is MemoryLane?',
    answer: 'MemoryLane is a collaborative platform that allows you to create beautiful memory books with contributions from multiple people. Perfect for birthdays, weddings, retirements, and other special occasions.'
  },
  {
    question: 'How do I create my first project?',
    answer: 'Simply sign up for an account, click "Create New Project" from your dashboard, choose an occasion, add project details, and start inviting contributors. You can customize layouts and add photos as you go.'
  },
  {
    question: 'Is there a limit to the number of projects I can create?',
    answer: 'No, you can create unlimited projects. Each project can have its own contributors, photos, and custom layouts.'
  },
  {
    question: 'How many people can contribute to a single project?',
    answer: 'There is no limit to the number of contributors. You can invite as many friends, family members, or colleagues as you like to add their photos and messages.'
  },
  {
    question: 'Do contributors need an account to participate?',
    answer: 'No, contributors can participate using a unique project link. They can upload photos and add messages without creating an account, making it easy for everyone to join.'
  },
  {
    question: 'How do I share my project with contributors?',
    answer: 'You can share your project by sending the unique project link via email, text message, or social media. Contributors can access the project instantly using this link.'
  },
  {
    question: 'What types of photos can I upload?',
    answer: 'You can upload JPG, PNG, and most common image formats. We recommend high-resolution images for the best print quality.'
  },
  {
    question: 'Is there a limit to how many photos I can add?',
    answer: 'The number of photos depends on your chosen book size and layout. Each layout template indicates how many photos it can accommodate.'
  },
  {
    question: 'Can I add messages or text to the book?',
    answer: 'Yes! Each contributor can add personalized messages, captions, and stories alongside their photos. You can also add signatures and special dedications.'
  },
  {
    question: 'Can I customize the layout of my book?',
    answer: 'Absolutely! We offer multiple pre-designed layout templates, and you can arrange photos and text however you prefer. Each page can have a different layout.'
  },
  {
    question: 'What cover options are available?',
    answer: 'We offer various cover designs that you can personalize with titles, names, dates, and special messages. You can also upload a custom cover photo.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. All transactions are secure and encrypted.'
  },
  {
    question: 'How much does a memory book cost?',
    answer: 'Pricing varies based on book size, number of pages, and cover options. You can see the exact price in your project dashboard before placing an order.'
  },
  {
    question: 'What if I encounter technical issues?',
    answer: 'Our support team is here to help! You can reach us via the chat support button on any page, or email us directly. We typically respond within 24 hours.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All your photos and data are encrypted and stored securely. We never share your information with third parties.'
  }
];

const FAQPage = () => {
  const { isSignedIn } = useCurrentUser();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isSignedIn={isSignedIn ?? false} />

      <main className="flex-grow bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            </div>
            <p className="text-base md:text-xl text-muted-foreground">
              Find answers to common questions about MemoryLane
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-3"
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                >
                  <h3 className="text-base md:text-lg font-semibold text-foreground flex-1 pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-2 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-border">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-4xl mx-auto mt-16 text-center bg-white rounded-lg border border-border p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is ready to help you create the perfect memory book.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@memorylane.com"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Support
              </a>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
