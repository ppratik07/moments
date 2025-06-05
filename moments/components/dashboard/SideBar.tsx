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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Sidebar({ imageKey, projectId }: { imageKey?: string; projectId?: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = imageKey ? `${baseUrl}/${imageKey}` : undefined;
  const [isMemoryBookOpen, setMemoryBookOpen] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const shareLink = currentUrl ? `${currentUrl.origin}/contribution/${projectId}` : '';

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
    router.push(`/download/${projectId}`);
    window.open(url, '_blank');
  };

  const handleInviteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInviteModalOpen(true);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: `/dashboard` },
    { icon: <SlidersHorizontal size={18} />, label: "Contributions", href: `/project/${projectId}/contributions` },
    { icon: <UsersRound size={18} />, label: "Invite", onClick: handleInviteClick },
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
              onClick={item.onClick}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-700"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Share Your Project</h2>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with everyone you would like to contribute to your project.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={shareLink}
                readOnly
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                className="cursor-pointer"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Close
              </Button>
              <Button
                className="cursor-pointer"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}