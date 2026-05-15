import {
  AppShellHeader,
  AppSidebarDesktop,
  BottomNavMobile,
} from "@/components/AppShell";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <AppSidebarDesktop />
      <div className="flex min-h-[100vh] flex-1 flex-col bg-[var(--bg)] pb-16 md:max-h-[100vh] md:overflow-hidden md:pb-0">
        <AppShellHeader />
        <main className="relative flex flex-1 flex-col overflow-auto overscroll-none md:h-0 md:min-h-0 md:flex-1">
          {children}
        </main>
      </div>
      <BottomNavMobile />
    </div>
  );
}
