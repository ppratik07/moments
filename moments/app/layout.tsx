import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Toaster as Sonner } from "sonner";
import TawkChat from "@/components/chatbot/TawkChat";

import VideoModal from "@/components/VideoModal"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemoryLane - Create Memories Together",
  description: "Collect memories, photos, and messages from friends and family to create a meaningful keepsake for life's special moments.",
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
          <VideoModal />
        </body>
      </html>
    </ClerkProvider>
  );
}
