import { Album, BringToFront, LayoutDashboard, Settings, SlidersHorizontal, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar({ imageKey, projectId }: { imageKey: string; projectId?: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = `${baseUrl}/${imageKey}`;

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: `/project/${projectId}` },
    { icon: <SlidersHorizontal size={18} />, label: "Contributions", href: `/project/${projectId}/contributions` },
    { icon: <UsersRound size={18} />, label: "Invite", href: "/dashboard/invite" },
    { icon: <Album size={18} />, label: "Memory Book", href: "/dashboard/memory-book" },
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
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-700"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
