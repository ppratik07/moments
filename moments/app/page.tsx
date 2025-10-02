import { LandingPage } from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Create beautiful collaborative memory books with friends and family. Collect photos, messages, and special moments for birthdays, weddings, anniversaries, and more.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  // JSON-LD structured data for better SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MemoryLane",
    "applicationCategory": "LifestyleApplication",
    "description": "Collect memories, photos, and messages from friends and family to create a meaningful keepsake for life's special moments.",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100"
    },
    "featureList": [
      "Collaborative memory collection",
      "Photo and message sharing",
      "Beautiful memory books",
      "Special occasion keepsakes",
      "Easy sharing with friends and family"
    ]
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MemoryLane",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/logo.png`,
    "sameAs": [
      // Add your social media links here
      "https://facebook.com/memorylane",
      "https://twitter.com/memorylane",
      "https://instagram.com/memorylane"
    ]
  };

  return (
    <>
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main>
        <LandingPage />
      </main>
    </>
  );
}
