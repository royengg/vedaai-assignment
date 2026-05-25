"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { CreateAssignmentForm } from "@/components/create-assignment/create-assignment-form";
import { useAuthStore } from "@/store/auth.store";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-main-bg">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px]">
        {/* Top Header - Both Desktop and Mobile */}
        <Header />

        {/* Page Header */}
        <div className="px-4 md:px-6 pt-20 md:pt-24 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              Create Assignment
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 ml-5">
            Set up a new assignment for your students
          </p>
          {/* Mobile Back Button */}
          <button
            onClick={() => router.back()}
            className="md:hidden mt-3 ml-5 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 bg-main-bg overflow-x-hidden px-4 md:px-6 pb-24 md:pb-8">
          <CreateAssignmentForm />
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNav />
      </div>
    </div>
  );
}
