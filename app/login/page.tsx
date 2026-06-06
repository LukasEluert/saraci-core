import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--bg)] p-6">
      <Image
        src="/logo-white.png"
        alt="Saraci"
        width={200}
        height={163}
        priority
        className="h-auto w-[160px]"
      />
      <LoginForm />
    </div>
  );
}
