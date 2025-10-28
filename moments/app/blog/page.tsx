import { Metadata } from "next";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog - MemoryLane",
  description: "Discover helpful articles, creative ideas, and inspiring stories about memory books, celebrations, and preserving life's special moments.",
  keywords: ["memory book blog", "photo book tips", "celebration ideas", "memory keeping", "special occasions"],
};

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "10 Creative Ways to Capture Wedding Memories",
    excerpt: "Discover innovative approaches to preserving your special day with unique photo book layouts and memory collection techniques.",
    content: "Your wedding day is one of the most important days of your life, and capturing every moment is essential. From candid shots during preparation to emotional ceremony moments and joyful reception celebrations, there are countless memories to preserve. In this comprehensive guide, we'll explore creative techniques for organizing your wedding photos, choosing the perfect layout designs, and involving your guests in creating a collaborative memory book that tells the complete story of your love.",
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
    content: "Collaborative memory keeping transforms individual moments into shared experiences. When multiple people contribute their perspectives, photos, and stories, the resulting memory book becomes a rich tapestry of different viewpoints and emotions. This approach is particularly powerful for milestone celebrations like graduations, retirements, or milestone birthdays where different people have unique relationships with the person being celebrated.",
    author: "Michael Chen",
    date: "2024-01-10",
    category: "Tips & Guides",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: 3,
    title: "Birthday Memory Books: Making Every Year Count",
    excerpt: "Transform birthday celebrations into lasting memories with personalized photo books that capture the essence of each milestone.",
    content: "Birthdays mark the passage of time and the growth of relationships. Whether it's a child's first birthday, a teenager's sweet sixteen, or a grandparent's 80th celebration, each birthday tells a unique story. Creating a memory book for birthdays allows you to capture not just the day itself, but the journey that led to this moment. Include photos from throughout the year, messages from loved ones, and special moments that defined the past year.",
    author: "Emily Rodriguez",
    date: "2024-01-05",
    category: "Birthdays",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: 4,
    title: "Digital vs. Physical Memory Books: Finding the Right Balance",
    excerpt: "Explore the benefits of both digital and physical memory books to create the perfect keepsake for your special moments.",
    content: "In today's digital age, we have more options than ever for preserving memories. Digital memory books offer convenience, easy sharing, and the ability to include multimedia elements like videos and audio recordings. Physical memory books provide a tangible connection to memories, with the texture of pages and the weight of the book creating a more intimate experience. The best approach often combines both formats.",
    author: "David Thompson",
    date: "2024-01-01",
    category: "Technology",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Anniversary Celebrations: Honoring Years of Love",
    excerpt: "Create meaningful anniversary memory books that celebrate the journey of love, growth, and shared experiences.",
    content: "Anniversaries are perfect opportunities to reflect on the journey you've taken together. Whether it's your first anniversary or your fiftieth, each milestone represents a chapter in your love story. Anniversary memory books can include photos from your wedding day, highlights from each year of marriage, and messages from family and friends who have witnessed your love grow. Include both the big moments and the everyday memories that make your relationship special.",
    author: "Lisa Wang",
    date: "2023-12-28",
    category: "Anniversaries",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 6,
    title: "Preserving Family Traditions Through Memory Books",
    excerpt: "Learn how memory books can help preserve and pass down family traditions, stories, and heritage to future generations.",
    content: "Family traditions are the threads that connect generations. From holiday celebrations to annual family reunions, these traditions create a sense of belonging and continuity. Memory books dedicated to family traditions serve as both documentation and inspiration. They capture the evolution of traditions over time, include family recipes, stories, and photos, and provide a way for younger generations to understand their heritage.",
    author: "Robert Martinez",
    date: "2023-12-20",
    category: "Family",
    readTime: "9 min read",
    featured: true,
  },
];

const categories = ["All", "Weddings", "Birthdays", "Anniversaries", "Family", "Tips & Guides", "Technology"];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header isSignedIn={false} />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-accent to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block w-auto mx-auto bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <p className="text-secondary flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    NEW Articles
                  </span>
                  <span className="text-sm">MemoryLane Blog</span>
                </p>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="h-12 w-12 mr-3 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  MemoryLane <span className="text-gradient">Blog</span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                Discover inspiring stories, helpful tips, and creative ideas for preserving life's most precious moments
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {categories.slice(1).map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/50 transition-colors cursor-pointer text-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Featured Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary opacity-80" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{post.title}</h3>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <Link 
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Latest Articles</h2>
            <div className="max-w-4xl mx-auto">
              {recentPosts.map((post) => (
                <article key={post.id} className="border-b border-border py-8 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary opacity-80" />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full mb-3">
                        {post.category}
                      </span>
                      <h3 className="text-2xl font-bold mb-3 text-foreground">{post.title}</h3>
                      <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                        <Link 
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                        >
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-primary-foreground/80 mb-8">
                Get the latest tips, stories, and inspiration delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
