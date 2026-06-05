import { MainLayout } from "@/components/MainLayout";
import { requireAdmin } from "@/lib/auth/profile";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Interne Tooling-Seiten sind admin-only; Vertrieb wird nach /akquise geleitet.
  await requireAdmin();
  return <MainLayout>{children}</MainLayout>;
}
