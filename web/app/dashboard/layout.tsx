import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import OnboardingGuard from "@/components/OnboardingGuard";
import TopUpModal from "@/components/TopUpModal";
import WithdrawModal from "@/components/WithdrawModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar Component */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Topbar Component */}
          <DashboardTopbar />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
      <TopUpModal />
      <WithdrawModal />
    </OnboardingGuard>
  );
}
