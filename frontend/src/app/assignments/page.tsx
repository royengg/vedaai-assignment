"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { AssignmentCard } from "@/components/assignment-card";
import { EmptyState } from "@/components/empty-state";
import { assignmentApi } from "@/api/assignment";
import { useAuthStore } from "@/store/auth.store";

export default function AssignmentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignments();
    }
  }, [isAuthenticated]);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentApi.list();
      setAssignments(data.assignments);
      setFilteredAssignments(data.assignments);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter((a) =>
        a.subjectName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await assignmentApi.delete(id);
      const updated = assignments.filter((a) => a.id !== id);
      setAssignments(updated);
      setFilteredAssignments(
        searchQuery
          ? updated.filter((a) =>
              a.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : updated
      );
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      alert("Failed to delete assignment");
    }
  };

  if (authLoading || isLoading) {
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
      {/* Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[280px]">
        <Header />

        {/* Page Header */}
        <div className="px-4 md:px-6 pt-20 md:pt-24 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              Assignments
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 ml-5">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Content */}
        <main className="flex-1 bg-main-bg overflow-y-auto px-4 md:px-6 pb-24 md:pb-8">
          {/* Search & Filter Bar */}
          <div className="flex items-center bg-white rounded-full border border-gray-200 px-2 py-2 mb-6">
            <div className="flex items-center gap-2 px-4 text-sm text-gray-500">
              <SlidersHorizontal size={16} className="text-gray-400" />
              <span>Filter By</span>
            </div>
            
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 w-[200px] md:w-[260px] border border-gray-200">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 w-full"
                />
              </div>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                subjectName={assignment.subjectName}
                assignedOn={assignment.createdAt}
                dueDate={assignment.dueDate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAssignments.length === 0 && !searchQuery && <EmptyState />}
          
          {filteredAssignments.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500">No assignments found</p>
            </div>
          )}
        </main>

        {/* Floating Create Button */}
        <Link
          href="/assignments/create"
          className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 ${assignments.length === 0 ? "md:hidden" : ""}`}
        >
          <button className="w-12 h-12 md:w-auto md:h-auto md:flex md:items-center md:gap-2 md:px-6 md:py-3 bg-white md:bg-button-dark text-[#FF6B35] md:text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center">
            <Plus size={20} className="md:size-4" />
            <span className="hidden md:inline">Create Assignment</span>
          </button>
        </Link>

        <BottomNav />
      </div>
    </div>
  );
}
