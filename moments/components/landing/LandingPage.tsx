'use client'
import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Occasions from '@/components/landing/Occasions';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';
import { Footer } from './Footer';
import { Header } from './Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const LandingPage = () => {
     const { isSignedIn } = useCurrentUser();

    return (
        <div className="min-h-screen">
            <Header isSignedIn={isSignedIn ?? false}/>
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