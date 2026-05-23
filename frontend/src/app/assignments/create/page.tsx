import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { CreateAssignmentForm } from "@/components/create-assignment/create-assignment-form";

export default function CreateAssignmentPage() {
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
