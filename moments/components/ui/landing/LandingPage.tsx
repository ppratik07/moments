import React from 'react';
import HeroSection from '@/components/ui/landing/components/HeroSection';
import HowItWorks from '@/components/ui/landing/components/HowItWorks';
import Features from '@/components/ui/landing/components/Features';
import Occasions from '@/components/ui/landing/components/Occasions';
import Testimonials from '@/components/ui/landing/components/Testimonials';
import CTASection from '@/components/ui/landing/components/CTASection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

export const LandingPage = () => {


    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <HeroSection />
                <div id="how-it-works">
                    <HowItWorks />
                </div>
                <div id="features">
                    <Features />
                </div>
                <div id="occasions">
                    <Occasions />
                </div>
                <div id="testimonials">
                    <Testimonials />
                </div>
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};