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
import { useState } from "react";

export default function Sidebar({ imageKey, projectId }: { imageKey: string; projectId?: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = `${baseUrl}/${imageKey}`;
  const [isMemoryBookOpen, setMemoryBookOpen] = useState(true);

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: `/project/${projectId}` },
    { icon: <SlidersHorizontal size={18} />, label: "Contributions", href: `/project/${projectId}/contributions` },
    { icon: <UsersRound size={18} />, label: "Invite", href: "/dashboard/invite" },
    {
      icon: <Album size={18} />,
      label: "Memory Book",
      expandable: true,
      children: [
        { label: "Preview Book", href: "/dashboard/memory-book/preview" },
        { label: "Customize Book", href: "/dashboard/memory-book/customize" },
        { label: "Online Version", href: "/dashboard/memory-book/online" },
      ],
    },
    { icon: <BringToFront size={18} />, label: "Orders", href: "/dashboard/orders" },
    { icon: <Settings size={18} />, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-[19rem] bg-white border-r p-4">
      <Image
        src={imageUrl}
        alt="Project cover"
        className="mb-6"
        width={300}
        height={300}
      />

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
