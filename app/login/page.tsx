import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--bg)] p-6">
      <BrandLogo size="lg" showWordmark className="gap-3" />
      <LoginForm />
    </div>
  );
}
