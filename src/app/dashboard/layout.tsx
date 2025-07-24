import Header from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import { Toaster } from "@/components/ui/toaster";

// Force dynamic rendering to prevent static generation issues with useSearchParams
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col gap-2 p-2 sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="flex-1 items-start">
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </main>
        <Toaster />
      </div>
    </div>
  );
}
