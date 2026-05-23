"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export function NavItem({ href, icon: Icon, label, isActive = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? "bg-white/60 text-text-active font-semibold shadow-sm" 
          : "text-text-muted hover:text-text-active hover:bg-white/40"
        }
      `}
    >
      <Icon 
        size={20} 
        strokeWidth={isActive ? 2.5 : 2}
        className="flex-shrink-0"
      />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
