import { MainLayout } from "@/components/MainLayout";
import { requireUser } from "@/lib/auth/profile";

export default async function AkquiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Jeder eingeloggte Nutzer (Vertrieb oder Admin); Datenfilter laeuft ueber RLS.
  await requireUser();
  return <MainLayout>{children}</MainLayout>;
}
