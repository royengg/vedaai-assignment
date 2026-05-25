"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, Menu, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/auth");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex h-[60px] bg-white items-center justify-between px-6 fixed top-3 left-[280px] right-6 z-40 rounded-2xl shadow-2xl shadow-black/[0.07]">
        {/* Left: Back + Breadcrumb */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/assignments")}
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

        {/* Right: Notifications + Auth */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button 
            className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-text-heading" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-notification-dot rounded-full" />
          </button>

          {isAuthenticated && user ? (
            /* User Profile Dropdown */
            <div className="relative inline-block" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-black/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-heading">
                  {user}
                </span>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-lg shadow-black/10 border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={16} className="text-gray-500 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login Button */
            <Link
              href="/auth"
              className="flex items-center gap-2 px-4 py-2 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="flex md:hidden h-14 bg-white items-center justify-between px-4 fixed top-3 left-3 right-3 z-40 rounded-2xl shadow-2xl shadow-black/[0.07]">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
            <img
              src="/vedaai-logo.png"
              alt="VedaAI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-bold text-text-active tracking-tight">
            VedaAI
          </span>
        </div>

        {/* Right: Auth + Menu */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-button-dark text-white rounded-full text-xs font-medium"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-button-dark text-white rounded-full text-xs font-medium"
            >
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          )}

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
