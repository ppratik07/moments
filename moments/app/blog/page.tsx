// moments/app/blog/page.tsx
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isSignedIn={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          Our Latest Stories & Tips
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to the MemoryLane blog! Here you will find tips on creating
          the perfect memory book for your loved ones, along with inspiring
          stories.
        </p>

        <div className="space-y-8">
          {/* Sample Blog Post 1 */}
          <article className="border-b pb-8">
            <h2 className="text-2xl font-semibold text-primary hover:text-primary/90 transition-colors">
              <a href="#">The Perfect Retirement Gift: A Collaborative Book</a>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Published: September 15, 2025
            </p>
            <p className="mt-3 text-gray-700">
              Retirement marks the end of one chapter and the beginning of
              another. There is no better way to honor a colleague or family
              member than with a collection of shared memories, photos, and
              personalized messages from everyone who worked alongside them.
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Read More »
            </a>
          </article>
          {/* Sample Blog Post 2 */}
          <article className="border-b pb-8">
            <h2 className="text-2xl font-semibold text-primary hover:text-primary/90 transition-colors">
              <a href="#">
                3 Simple Steps to Collect Memories for a Milestone Birthday
              </a>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Published: August 28, 2025
            </p>
            <p className="mt-3 text-gray-700">
              Planning a 50th or 70th birthday party? Don't forget the gift that
              truly lasts: a custom memory book. We'll walk you through how to
              easily gather heartfelt contributions from friends and family,
              even the non-tech savvy ones!
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Read More »
            </a>
          </article>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">More posts coming soon!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
