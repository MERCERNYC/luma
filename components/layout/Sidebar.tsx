
import Image from "next/image";
import Link from "next/link";
import {
  House,
  Inbox,
  Check,
  Settings,
} from "lucide-react";

// Each object describes one sidebar menu item.
const menuItems = [
  { label: "Today", href: "/", icon: House },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Done", href: "/done", icon: Check },
  { label: "Settings", href: "/settings", icon: Settings },
];

// A component is a reusable part of the interface.
export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white p-5">

      {/* Display our official LUMA logo. */}
      <div className="mb-10">
        <Image
          src="/images/luma-brand-logo.png"
          alt="LUMA — Less inbox. More life."
          width={190}
          height={85}
          className="h-auto w-full"
          priority
          unoptimized
        />
      </div>

      {/* Create a navigation menu from our list. */}
      <nav className="space-y-2" aria-label="Main navigation">
        {menuItems.map((item) => {
          // Get the icon for this menu item.
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#1B2748] hover:bg-[#E8EDFF]"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
