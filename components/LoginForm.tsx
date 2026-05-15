"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        setError(signErr.message || "Login fehlgeschlagen.");
        return;
      }

      router.replace("/overview");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-primary)]">
        SARACI <span className="text-[var(--accent)]">CORE</span>
      </div>
      <div className="mt-3 text-xl font-medium tracking-tight text-[var(--text-primary)]">Anmelden</div>
      <div className="mt-2 text-sm text-[var(--text-secondary)]">
        Nutze denselben Supabase-Account wie bei Saraci Desk.
      </div>

      <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
        <label className="block space-y-1">
          <span className="label-caps">E-Mail</span>
          <input
            autoComplete="email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)]"
          />
        </label>

        <label className="block space-y-1">
          <span className="label-caps">Passwort</span>
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)]"
          />
        </label>

        {error && (
          <div className="rounded-md border border-[var(--accent)] bg-[var(--accent-dim)] px-3 py-2 text-xs text-[var(--text-primary)]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="focus-ring w-full rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
        >
          {pending ? "Wird geprüft…" : "Login"}
        </button>
      </form>
    </div>
  );
}
