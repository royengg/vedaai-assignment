"use client";

import { Home, ClipboardList, Library, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: BottomNavItem[] = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: ClipboardList, label: "Assignments", href: "/assignments" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Sparkles, label: "AI Toolkit", href: "/toolkit" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden fixed bottom-4 left-4 right-4 h-16 bg-button-dark z-50 rounded-2xl shadow-2xl shadow-black/[0.07]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 
              transition-colors duration-200 rounded-xl mx-1
              ${isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
              }
            `}
            aria-label={item.label}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-xs ${isActive ? "font-semibold" : "font-normal"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
