'use client';

import { useAuth } from "@clerk/nextjs";
import {
  Album,
  // BringToFront,
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
import axios from 'axios';
import { HTTP_BACKEND } from '@/utils/config';

export default function Sidebar({ imageKey, projectId }: { imageKey?: string; projectId?: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = imageKey ? `${baseUrl}/${imageKey}` : undefined;
  const [isMemoryBookOpen, setMemoryBookOpen] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const shareLink = currentUrl ? `${currentUrl.origin}/contribution/${projectId}` : '';

  const checkPaymentStatus = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to obtain authentication token');
      }
      const response = await axios.get(`${HTTP_BACKEND}/api/check-payment-status`, {
        params: { project_id: projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.hasPaid;
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Failed to check payment status');
      return false;
    }
  };

  const handlePreviewClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = await getToken();
    const response = await fetch(`${HTTP_BACKEND}/api/preview/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bookData = await response.json();
    if (!bookData.pages) {
      console.error("No pages found in book data");
      toast.error('No pages available for preview');
      return;
    }
    router.push(`/previewbook/${projectId}`);
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!projectId) {
      toast.error('Invalid project ID');
      return;
    }

    // Check if user has already paid
    const hasPaid = await checkPaymentStatus();
    if (hasPaid || isPaymentSuccessful) {
      // Proceed with PDF download
      setIsDownloading(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to obtain authentication token');
        }
        const response = await fetch(`${HTTP_BACKEND}/api/pdf/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        router.push(`/download/${projectId}`);
        window.open(url, '_blank');
      } catch (error) {
        toast.error('Failed to download PDF');
        console.error('Download failed:', error);
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    // Initiate payment process
    setIsPaymentProcessing(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to obtain authentication token');
      }

      // Create Razorpay order
      const orderResponse = await axios.post(
        `${HTTP_BACKEND}/api/create-order`,
        {
          project_id: projectId,
          amount: 9900, // 100 INR in paise
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order_id, amount, currency } = orderResponse.data;

      // Load Razorpay Checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: amount,
          currency: currency,
          name: 'Memory Lane',
          description: `Payment for PDF download of project ${projectId}`,
          order_id: order_id,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              // Verify payment
              const verifyResponse = await axios.post(
                `${HTTP_BACKEND}/api/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount,
                  project_id: projectId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (verifyResponse.data.success) {
                setIsPaymentSuccessful(true);
                toast.success('Payment successful! Initiating PDF download...');
                // Trigger PDF download
                setIsDownloading(true);
                try {
                  const pdfResponse = await fetch(`${HTTP_BACKEND}/api/pdf/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (!pdfResponse.ok) {
                    throw new Error('Failed to fetch PDF');
                  }
                  const blob = await pdfResponse.blob();
                  const url = window.URL.createObjectURL(blob);
                  router.push(`/download/${projectId}`);
                  window.open(url, '_blank');
                } catch (error) {
                  toast.error('Failed to download PDF');
                  console.error('Download failed:', error);
                } finally {
                  setIsDownloading(false);
                }
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#F59E0B',
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        toast.error('Failed to load Razorpay Checkout');
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsPaymentProcessing(false);
    }
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
          label: "View PDF",
          href: `/download/${projectId}`,
          onClick: handleDownloadPdf
        },
      ],
    },
    {
      // icon: <BringToFront size={18} />, label: "Orders", href: `/orders`//, target: "_blank",
      // rel: "noopener noreferrer",
      // onClick: (e: React.MouseEvent) => {
      //   e.preventDefault();
      //   window.open('/orders', '_blank', 'noopener,noreferrer');
      // }
    },
    { icon: <Settings size={18} />, label: "Settings", href: `/project/${projectId}/settings` },
  ];

  return (
    <aside className="w-[19rem] bg-white border-r p-4">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Project cover"
          className="mb-6 object-contain"
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
                      <button
                        key={i}
                        onClick={child.onClick}
                        className="block text-left text-sm text-gray-600 hover:text-blue-600 w-full"
                        disabled={isPaymentProcessing || isDownloading}
                      >
                        {isPaymentProcessing && child.label === "View PDF"
                          ? "Processing Payment..."
                          : isDownloading && child.label === "View PDF"
                            ? "Downloading PDF..."
                            : child.label}
                      </button>
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
              // target={item.target}
              // rel={item.rel}
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