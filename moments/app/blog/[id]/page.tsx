import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

// Sample blog posts data (in a real app, this would come from a database or CMS)
const blogPosts = [
  {
    id: 1,
    title: "10 Creative Ways to Capture Wedding Memories",
    excerpt: "Discover innovative approaches to preserving your special day with unique photo book layouts and memory collection techniques.",
    content: `
      <p>Your wedding day is one of the most important days of your life, and capturing every moment is essential. From candid shots during preparation to emotional ceremony moments and joyful reception celebrations, there are countless memories to preserve.</p>
      
      <h2>Planning Your Wedding Memory Collection</h2>
      <p>Start by creating a comprehensive plan for your wedding memory book. Consider the timeline of your day and identify key moments you want to capture:</p>
      
      <ul>
        <li><strong>Getting Ready:</strong> Capture the anticipation and excitement as you prepare for your big day</li>
        <li><strong>First Look:</strong> The emotional moment when you first see each other</li>
        <li><strong>Ceremony:</strong> Every meaningful moment of your vows and celebration</li>
        <li><strong>Reception:</strong> The joy and celebration with family and friends</li>
      </ul>
      
      <h2>Creative Layout Ideas</h2>
      <p>Your wedding memory book should reflect your unique love story. Consider these creative layout approaches:</p>
      
      <h3>Timeline Layout</h3>
      <p>Organize your photos chronologically to tell the complete story of your wedding day from start to finish.</p>
      
      <h3>Emotional Journey</h3>
      <p>Group photos by emotion and significance rather than time, creating a narrative flow that captures the feelings of the day.</p>
      
      <h3>Guest Contributions</h3>
      <p>Include photos and messages from your guests to create a truly collaborative memory book that captures multiple perspectives of your special day.</p>
      
      <h2>Tips for Perfect Wedding Memory Books</h2>
      <p>Here are some expert tips to help you create the perfect wedding memory book:</p>
      
      <ol>
        <li><strong>Start Early:</strong> Begin planning your memory book layout before the wedding day</li>
        <li><strong>Include Variety:</strong> Mix professional photos with candid shots and guest contributions</li>
        <li><strong>Tell Your Story:</strong> Add personal anecdotes, quotes, and memories alongside the photos</li>
        <li><strong>Quality Matters:</strong> Use high-resolution images for the best print quality</li>
        <li><strong>Personal Touch:</strong> Include personal items like invitation copies, pressed flowers, or handwritten notes</li>
      </ol>
      
      <p>Creating a wedding memory book is more than just organizing photos – it's about preserving the emotions, stories, and love that made your day special. With thoughtful planning and creative design, you can create a keepsake that will bring back those precious memories for years to come.</p>
    `,
    author: "Sarah Johnson",
    date: "2024-01-15",
    category: "Weddings",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "The Art of Collaborative Memory Keeping",
    excerpt: "Learn how to create meaningful memory books by involving friends and family in the storytelling process.",
    content: `
      <p>Collaborative memory keeping transforms individual moments into shared experiences. When multiple people contribute their perspectives, photos, and stories, the resulting memory book becomes a rich tapestry of different viewpoints and emotions.</p>
      
      <h2>Why Collaboration Matters</h2>
      <p>Every person experiences events differently, and their unique perspectives add depth and richness to your memory collection. Collaborative memory keeping allows you to:</p>
      
      <ul>
        <li>Capture moments you might have missed</li>
        <li>Include different viewpoints and emotions</li>
        <li>Create a more complete story</li>
        <li>Strengthen relationships through shared storytelling</li>
      </ul>
      
      <h2>Getting Started with Collaborative Memory Keeping</h2>
      <p>Here's how to begin creating collaborative memory books:</p>
      
      <h3>1. Choose Your Contributors</h3>
      <p>Identify the key people who should contribute to your memory book. Consider family members, close friends, colleagues, or anyone who shared in the experience.</p>
      
      <h3>2. Set Clear Guidelines</h3>
      <p>Provide contributors with clear instructions about what you're looking for, including photo requirements, story length, and submission deadlines.</p>
      
      <h3>3. Use Digital Tools</h3>
      <p>Leverage online platforms and apps to make it easy for people to contribute their memories, photos, and stories.</p>
      
      <h2>Best Practices for Collaborative Projects</h2>
      <p>To ensure your collaborative memory book project is successful:</p>
      
      <ol>
        <li><strong>Start Early:</strong> Give contributors plenty of time to gather their memories</li>
        <li><strong>Be Specific:</strong> Provide clear examples of what you're looking for</li>
        <li><strong>Follow Up:</strong> Gently remind contributors about deadlines</li>
        <li><strong>Show Gratitude:</strong> Thank everyone who contributes to your project</li>
        <li><strong>Share Results:</strong> Let contributors see the final product</li>
      </ol>
    `,
    author: "Michael Chen",
    date: "2024-01-10",
    category: "Tips & Guides",
    readTime: "7 min read",
    featured: false,
  },
  // Add more sample posts as needed...
];

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts.find(p => p.id === parseInt(params.id));
  
  if (!post) {
    return {
      title: "Post Not Found - MemoryLane Blog",
    };
  }

  return {
    title: `${post.title} - MemoryLane Blog`,
    description: post.excerpt,
    keywords: ["memory book", "photo book", post.category.toLowerCase()],
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find(p => p.id === parseInt(params.id));

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header isSignedIn={false} />
      <main className="pt-20">
        {/* Navigation */}
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  {post.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {post.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  <button className="flex items-center text-primary hover:text-primary/80">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Article Image Placeholder */}
              <div className="mb-12">
                <div className="h-96 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-primary opacity-80" />
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  className="text-foreground leading-relaxed"
                />
              </div>

              {/* Article Footer */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{post.author}</h3>
                      <p className="text-muted-foreground text-sm">MemoryLane Contributor</p>
                    </div>
                  </div>
                  <button className="flex items-center text-primary hover:text-primary/80 font-medium">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Article
                  </button>
                </div>
              </div>
          </div>
        </div>
      </article>

        {/* Related Articles */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Related Articles</h2>
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
              {blogPosts
                .filter(p => p.id !== post.id && p.category === post.category)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                    <article className="bg-card rounded-lg p-6 hover:bg-card/80 transition-colors border border-border">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-primary opacity-80" />
                      </div>
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {relatedPost.category}
                      </span>
                      <h3 className="font-bold text-card-foreground mb-2">{relatedPost.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{relatedPost.excerpt}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(relatedPost.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        <span className="mx-2">•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </article>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
