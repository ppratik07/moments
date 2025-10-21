import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | MemoryLane Blog",
    default: "Blog - MemoryLane",
  },
  description: "Discover helpful articles, creative ideas, and inspiring stories about memory books, celebrations, and preserving life's special moments.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
