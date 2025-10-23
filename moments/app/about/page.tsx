'use client'; 
import React from "react";
import { BookOpen, Users, Image, Shield, Download } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
export default function AboutPage() {
  const { isSignedIn } = useCurrentUser();
  return (
    <div>
      <Header isSignedIn = { isSignedIn ?? false} />
      <div className="max-w-5xl mx-auto px-6 py-16 mt-10">
        {/* Header */}
        <section className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            About <span className="text-indigo-600">MemoryLane</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            <strong>MemoryLane</strong> is a collaborative
            digital memory book platform. Collect memories, photos, and heartfelt
            notes from friends and family into a beautiful keepsake.
          </p>
        </section>

        {/* Why It Exists */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Why It Exists
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Memories often end up scattered across chats, emails, and social
            media. Moments brings them together in one place — easy to use,
            collaborative, and meaningful. It’s the perfect gift for birthdays,
            weddings, retirements, or any special occasion.
          </p>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-indigo-600" />}
              title="Invite Contributors"
              desc="Start a project and let friends & family add their memories — no account needed."
            />
            <FeatureCard
              icon={<Image className="w-6 h-6 text-indigo-600" />}
              title="Collect Photos & Messages"
              desc="Upload photos and share heartfelt stories in one place."
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
              title="Layouts & Templates"
              desc="Choose from curated designs to showcase your story beautifully."
            />
            <FeatureCard
              icon={<Download className="w-6 h-6 text-indigo-600" />}
              title="Download & Print"
              desc="Export your book as a high-quality PDF ready for printing."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-indigo-600" />}
              title="Privacy & Security"
              desc="Your memories stay private and secure with full access control."
            />
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Tech Stack
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Frontend
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    Next.js, TypeScript, Tailwind CSS, shadcn UI, Zustand, Clerk
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Backend
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    Node.js / Express, Prisma ORM, PostgreSQL
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    Storage
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    R2 / AWS object storage for images
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Vision & Roadmap
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-300">
            <li>More templates and themes (seasonal, custom)</li>
            <li>Mobile-friendly enhancements</li>
            <li>Advanced editing (drag & drop, image effects)</li>
            <li>Better sharing options (view-only links, embed)</li>
            <li>Community features like public galleries</li>
          </ul>
        </section>
      </div>
      <Footer/>
    </div>

  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}


