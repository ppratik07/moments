import { Album, BringToFront, LayoutDashboard, Settings, SlidersHorizontal, UsersRound } from "lucide-react";
import Image from "next/image";

export default function Sidebar({ imageKey }: { imageKey: string }) {
  const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
  const imageUrl = `${baseUrl}/${imageKey}`;

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { icon: <SlidersHorizontal size={18} />, label: "Contributions" },
    { icon: <UsersRound size={18} />, label: "Invite" },
    { icon: <Album size={18} />, label: "Memory Book" },
    { icon: <BringToFront size={18} />, label: "Orders" },
    { icon: <Settings size={18} />, label: "Settings" },
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
          <a
            key={idx}
            href="#"
            className="flex items-center gap-3 text-gray-700 hover:text-black"
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
