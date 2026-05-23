import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";

export default function AssignmentsPage() {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[260px]">
        {/* Top Header - Both Desktop and Mobile */}
        <Header />

        {/* Content */}
        <main className="flex-1 bg-main-bg mt-14 md:mt-[60px] overflow-y-auto pb-16 md:pb-0">
          <EmptyState />
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNav />
      </div>
    </div>
  );
}
