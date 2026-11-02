import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectDir,
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api2-u745ap.transloadit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api2-u858ap.transloadit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api2-u638ap.transloadit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "memorylane.db134517dd79f4a26d091b4dcda7e499.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "db134517dd79f4a26d091b4dcda7e499.r2.cloudflarestorage.com",
        pathname: "/**",
      },
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
