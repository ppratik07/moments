'use client';

import { useAuth } from "@clerk/nextjs";
import {
  Album,
  BringToFront,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  UsersRound,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar({ imageKey, projectId }: { imageKey?: string; projectId?: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = imageKey ? `${baseUrl}/${imageKey}` : undefined;
  const [isMemoryBookOpen, setMemoryBookOpen] = useState(true);
  const { getToken } = useAuth();
  const router = useRouter();

  // Function to handle preview click
  const handlePreviewClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = await getToken();
    const response = await fetch(`http://localhost:8080/api/preview/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bookData = await response.json();
    if (!bookData.pages) {
      console.error("No pages found in book data");
      return;
    }
    router.push(`/previewbook/${projectId}`);
  };
  
  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = await getToken();
    const response = await fetch(`http://localhost:8080/api/pdf/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: `/project/${projectId}` },
    { icon: <SlidersHorizontal size={18} />, label: "Contributions", href: `/project/${projectId}/contributions` },
    { icon: <UsersRound size={18} />, label: "Invite", href: `/project/${projectId}/invite` },
    {
      icon: <Album size={18} />,
      label: "Memory Book",
      expandable: true,
      children: [
        { 
          label: "Preview Book", 
          href: `/previewbook/${projectId}`, 
          onClick: handlePreviewClick 
        },
        // { label: "Customize Book", href: `/project/${projectId}/memory-book/customize` },
        // { label: "Online Version", href: `/project/${projectId}/memory-book/online` },
        { 
          label: "Download PDF", 
          href: `/download/${projectId}`, 
          onClick: handleDownloadPdf 
        },
      ],
    },
    { icon: <BringToFront size={18} />, label: "Orders", href: `/project/${projectId}/orders` },
    { icon: <Settings size={18} />, label: "Settings", href: `/project/${projectId}/settings` },
  ];

  return (
    <aside className="w-[19rem] bg-white border-r p-4">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Project cover"
          className="mb-6"
          width={300}
          height={300}
        />
      )}

      <nav className="space-y-3">
        {navItems.map((item, idx) => {
          if (item.expandable && item.children) {
            return (
              <div key={idx}>
                <button
                  onClick={() => setMemoryBookOpen(!isMemoryBookOpen)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-700 w-full"
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {isMemoryBookOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isMemoryBookOpen && (
                  <div className="ml-6 mt-1 space-y-2">
                    {item.children.map((child, i) => (
                      <Link
                        key={i}
                        href={child.href}
                        onClick={child.onClick}
                        className="block text-sm text-gray-600 hover:text-blue-600"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href || "#"}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-700"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}