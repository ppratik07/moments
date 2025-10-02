# SEO Meta Tags Templates

Use these templates when creating new pages to ensure consistent SEO optimization.

## Basic Page Template

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title - MemoryLane",
  description: "Concise description of the page content (150-160 characters)",
  keywords: ["keyword1", "keyword2", "keyword3"],
  alternates: {
    canonical: "/page-url",
  },
  openGraph: {
    title: "Page Title",
    description: "Description for social sharing",
    url: "/page-url",
    type: "website",
    images: [
      {
        url: "/page-specific-image.jpg",
        width: 1200,
        height: 630,
        alt: "Descriptive alt text",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Description for Twitter sharing",
    images: ["/page-specific-image.jpg"],
  },
};

export default function PageName() {
  return (
    <main>
      {/* Page content */}
    </main>
  );
}
```

---

## Example: Dashboard Page

```typescript
// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Manage your memory books, view contributions, and track your projects.",
  robots: {
    index: false, // Don't index private pages
    follow: false,
  },
};

export default function Dashboard() {
  // Dashboard content
}
```

---

## Example: FAQ Page

```typescript
// app/faq/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about creating memory books, sharing photos, and using MemoryLane.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ - MemoryLane",
    description: "Everything you need to know about creating collaborative memory books",
    url: "/faq",
  },
};

export default function FAQ() {
  // FAQ structured data
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create a memory book?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To create a memory book, sign up for an account, click 'New Project', choose your occasion, and start collecting memories from friends and family."
        }
      },
      // Add more questions...
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main>
        {/* FAQ content */}
      </main>
    </>
  );
}
```

---

## Example: Blog Post

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  // Fetch blog post data
  const post = await getBlogPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    publishedTime: post.publishedDate,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedDate,
      authors: [post.author],
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default function BlogPost({ params }) {
  // Article structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Article Title",
    "image": "/article-image.jpg",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MemoryLane",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": "2025-01-02",
    "description": "Article description"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article>
        {/* Blog post content */}
      </article>
    </>
  );
}
```

---

## Example: Product/Pricing Page

```typescript
// app/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Choose the perfect plan for creating your memory books. Flexible pricing for individuals, families, and groups.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function Pricing() {
  // Product structured data
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Memory Book - Premium Plan",
    "description": "Premium memory book with unlimited pages and contributions",
    "offers": {
      "@type": "Offer",
      "url": "/pricing",
      "priceCurrency": "USD",
      "price": "29.99",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2025-12-31"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main>
        {/* Pricing content */}
      </main>
    </>
  );
}
```

---

## Example: Contact Page

```typescript
// app/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the MemoryLane team. We're here to help with questions, support, and feedback.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Contact() {
  // ContactPage structured data
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact MemoryLane",
    "description": "Contact information and support for MemoryLane"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <main>
        {/* Contact form */}
      </main>
    </>
  );
}
```

---

## SEO Best Practices Checklist

### Title Tags
- [ ] 50-60 characters long
- [ ] Include primary keyword
- [ ] Unique for each page
- [ ] Brand name at the end
- [ ] Compelling and descriptive

### Meta Descriptions
- [ ] 150-160 characters long
- [ ] Include primary keyword
- [ ] Unique for each page
- [ ] Include call-to-action
- [ ] Accurately describe content

### Keywords
- [ ] 5-10 relevant keywords
- [ ] Mix of short and long-tail
- [ ] Research-based selection
- [ ] Natural integration in content

### Images
- [ ] Descriptive alt text
- [ ] Compressed and optimized
- [ ] WebP or AVIF format
- [ ] Proper dimensions
- [ ] Lazy loading enabled

### Structured Data
- [ ] Appropriate schema type
- [ ] All required properties
- [ ] Valid JSON-LD syntax
- [ ] Tested with Rich Results tool

### URLs
- [ ] Short and descriptive
- [ ] Include target keyword
- [ ] Use hyphens, not underscores
- [ ] Lowercase letters
- [ ] No dynamic parameters

---

## Common Schema Types Reference

### WebPage
```json
{
  "@type": "WebPage",
  "name": "Page Name",
  "description": "Page description"
}
```

### Article / BlogPosting
```json
{
  "@type": "BlogPosting",
  "headline": "Article Title",
  "image": "/image.jpg",
  "author": { "@type": "Person", "name": "Author" },
  "datePublished": "2025-01-01"
}
```

### Product
```json
{
  "@type": "Product",
  "name": "Product Name",
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD"
  }
}
```

### FAQPage
```json
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Question?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Answer"
    }
  }]
}
```

### BreadcrumbList
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://domain.com"
  }]
}
```

### Review
```json
{
  "@type": "Review",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "author": { "@type": "Person", "name": "Reviewer" }
}
```

---

## Tools for Testing

1. **Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **Open Graph Debugger**: https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator

---

## Additional Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
