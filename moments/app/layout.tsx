import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Toaster as Sonner } from "sonner";
import TawkChat from "@/components/chatbot/TawkChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
  title: {
    default: "MemoryLane - Create Memories Together | Collaborative Photo Books & Memory Keepsakes",
    template: "%s | MemoryLane"
  },
  description: "Collect memories, photos, and messages from friends and family to create a meaningful keepsake for life's special moments. Perfect for birthdays, weddings, anniversaries, and more.",
  keywords: [
    "memory book",
    "photo book",
    "collaborative keepsake",
    "birthday memories",
    "wedding memories",
    "anniversary gift",
    "memory collection",
    "photo keepsake",
    "digital memory book",
    "personalized gift",
    "memory sharing",
    "collaborative photo album",
    "special occasions",
    "memory lane",
    "keepsake creation"
  ],
  icons: {
    icon: "/favicon_i.png"
  },
  authors: [{ name: "MemoryLane Team" }],
  creator: "MemoryLane",
  publisher: "MemoryLane",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MemoryLane",
    title: "MemoryLane - Create Memories Together",
    description: "Collect memories, photos, and messages from friends and family to create a meaningful keepsake for life's special moments.",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "MemoryLane - Create Memories Together" }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MemoryLane - Create Memories Together",
    description: "Collect memories, photos, and messages from friends and family to create a meaningful keepsake for life's special moments.",
    images: ["/twitter-image.png"],
    creator: "@memorylane"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "your-google-verification-code"
  },
  alternates: { canonical: "/" },
  category: "technology"
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster />
          <Sonner />
          {children}
          <TawkChat />
        </body>
      </html>
    </ClerkProvider>
  );
}
