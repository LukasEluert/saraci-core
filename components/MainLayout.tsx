import { AppSidebarDesktop } from "@/components/AppSidebar";
import { MobileTopBar } from "@/components/MobileTopBar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg)]">
      <AppSidebarDesktop />
      <MobileTopBar />

      <div className="flex min-h-[100dvh] flex-col lg:ml-[240px]">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto w-full max-w-[1400px] flex-1 p-4 lg:px-12 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
