import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev",
      "api2-u745ap.transloadit.com",
      "api2-u858ap.transloadit.com",
      "api2-u638ap.transloadit.com",
      "memorylane.db134517dd79f4a26d091b4dcda7e499.r2.cloudflarestorage.com",
      "db134517dd79f4a26d091b4dcda7e499.r2.cloudflarestorage.com"
    ],
    formats: ['image/avif', 'image/webp'], // Modern image formats for better performance
  },
  // Enable compression for better performance
  compress: true,
  // Generate ETags for better caching
  generateEtags: true,
  // Power by header removal for security
  poweredByHeader: false,
  // Strict mode for better React development
  reactStrictMode: true,
};

export default nextConfig;
