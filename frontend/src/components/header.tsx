"use client";

import { ArrowLeft, LayoutGrid, Bell, ChevronDown, Menu } from "lucide-react";

export function Header() {
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex h-[60px] bg-white items-center justify-between px-6 fixed top-3 left-[280px] right-6 z-40 rounded-2xl shadow-md shadow-black/10">
        {/* Left: Back + Breadcrumb */}
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-text-muted" />
          </button>
          
          <div className="flex items-center gap-2 text-text-muted">
            <LayoutGrid size={18} />
            <span className="text-sm font-medium">Assignment</span>
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button 
            className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-text-heading" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-notification-dot rounded-full" />
          </button>

          {/* User Profile Dropdown */}
          <button className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-black/5 transition-colors">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">JD</span>
            </div>
            <span className="text-sm font-medium text-text-heading">
              John Doe
            </span>
            <ChevronDown size={16} className="text-text-muted" />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="flex md:hidden h-14 bg-[#e8e8e8] items-center justify-between px-4 fixed top-3 left-3 right-3 z-40 rounded-2xl shadow-md shadow-black/10">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-red-500 to-red-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-lg font-bold text-text-active tracking-tight">
            VedaAI
          </span>
        </div>

        {/* Right: Notifications + Avatar + Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button 
            className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-text-heading" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-notification-dot rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">JD</span>
          </div>

          {/* Hamburger Menu */}
          <button 
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} className="text-text-heading" />
          </button>
        </div>
      </header>
    </>
  );
}
