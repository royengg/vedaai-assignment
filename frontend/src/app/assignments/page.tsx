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
          <div className="flex items-center gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200">
              <SlidersHorizontal size={16} className="text-gray-400" />
              <span>Filter By</span>
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50"
        >
          <button className="flex items-center gap-2 px-6 py-3 bg-button-dark text-white rounded-full text-sm font-medium shadow-lg hover:opacity-90 transition-opacity">
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>
        </Link>

        <BottomNav />
      </div>
    </div>
  );
}
