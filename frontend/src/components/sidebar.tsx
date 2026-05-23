"use client";

import { 
  LayoutGrid, 
  Users, 
  FileText, 
  BookOpen, 
  Clock, 
  Settings,
  Sparkles,
  Library
} from "lucide-react";
import Link from "next/link";
import { NavItem } from "./nav-item";
import { UserProfileCard } from "./user-profile-card";

const navigationItems = [
  { href: "/home", icon: LayoutGrid, label: "Home" },
  { href: "/groups", icon: Users, label: "My Groups" },
  { href: "/assignments", icon: FileText, label: "Assignments", isActive: true },
  { href: "/toolkit", icon: BookOpen, label: "AI Teacher's Toolkit" },
  { href: "/library", icon: Library, label: "My Library" },
];

export function Sidebar() {
  return (
    <aside className="w-[260px] h-[calc(100vh-16px)] bg-white flex flex-col flex-shrink-0 fixed left-2 top-2 z-50 rounded-2xl shadow-lg shadow-black/5 border-r border-white/20">
      {/* Logo Section */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 via-red-500 to-red-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold text-text-active tracking-tight">
            VedaAI
          </span>
        </div>
      </div>

      {/* Create Assignment Button */}
      <div className="px-5 mb-8">
        <Link href="/assignments/create" className="block">
          <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-button-dark text-white rounded-full border-2 border-button-border font-medium text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]">
            <Sparkles size={16} className="flex-shrink-0" />
            <span>Create Assignment</span>
          </button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 sidebar-scroll overflow-y-auto">
        {navigationItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-2">
        {/* Settings */}
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
        />
        
        {/* User Profile Card */}
        <UserProfileCard
          schoolName="Delhi Public School"
          location="Bokaro Steel City"
        />
      </div>
    </aside>
  );
}
