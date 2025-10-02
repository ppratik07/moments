// moments/app/features/page.tsx
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import FeaturesComponent from "@/components/landing/Features"; // Import the existing Features component
import OccasionsComponent from "@/components/landing/Occasions"; // Import the existing Occasions component

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isSignedIn={false} />
      <main className="flex-grow">
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Features & Use Cases
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover how MemoryLane makes it easy to create beautiful,
                collaborative memory books for any occasion.
              </p>
            </div>

            {/* Render the Occasions Component directly to show the visual tiles */}
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Popular Occasions
            </h2>
            <OccasionsComponent />

            <div className="mt-16 pt-8 border-t">
              <h2 className="text-3xl font-bold mb-4">Core Features</h2>
              {/* Render the Core Features from the existing component */}
              <FeaturesComponent />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
