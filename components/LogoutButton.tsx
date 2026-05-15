"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/login");
    setPending(false);
  };

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={pending}
      className="label-caps focus-ring rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-[7px]
        text-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
    >
      {pending ? "Wird geladen…" : "Logout"}
    </button>
  );
}
