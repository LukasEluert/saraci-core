"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";
import { createUser, regenerateCalendarToken, setUserRole } from "@/app/actions/admin";
import type { AdminUser } from "@/lib/admin/queries";

type Role = "admin" | "vertrieb";

export function UsersAdmin({ users }: { users: AdminUser[] }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <div className="space-y-8">
      <CreateUserForm />

      <div className="overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="bg-[var(--surface-hover)]">
            <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>E-Mail</th>
              <th className="hidden md:table-cell">Name</th>
              <th>Rolle</th>
              <th>Kalender-Link</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} origin={origin} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            Keine Nutzer.
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, origin }: { user: AdminUser; origin: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(user.role);
  const [token, setToken] = useState(user.calendar_token);
  const [pending, startTransition] = useTransition();

  const httpsUrl = origin ? `${origin}/api/calendar/${token}` : "";

  return (
    <tr className="border-b border-[var(--border-subtle)] [&>td]:px-4 [&>td]:py-3">
      <td className="font-mono text-[12px] text-[var(--text-primary)]">
        {user.email ?? "—"}
      </td>
      <td className="hidden text-[var(--text-secondary)] md:table-cell">
        {user.full_name ?? "—"}
      </td>
      <td>
        <select
          value={role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as Role;
            const prev = role;
            setRole(next);
            startTransition(async () => {
              try {
                await setUserRole(user.id, next);
                toast.success("Rolle aktualisiert");
                router.refresh();
              } catch (err) {
                setRole(prev);
                toast.error(err instanceof Error ? err.message : "Fehler");
              }
            });
          }}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-primary)] disabled:opacity-50"
        >
          <option value="vertrieb">Vertrieb</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!httpsUrl}
            onClick={() => {
              void navigator.clipboard.writeText(httpsUrl).then(() => {
                toast.success("Link kopiert");
              });
            }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <Copy className="size-3.5" strokeWidth={1.75} aria-hidden />
            Kopieren
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const res = await regenerateCalendarToken(user.id);
                  setToken(res.token);
                  toast.success("Token neu generiert");
                  router.refresh();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Fehler");
                }
              })
            }
            title="Token neu generieren (alter Link wird ungültig)"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <RefreshCw className="size-3.5" strokeWidth={1.75} aria-hidden />
            Neu
          </button>
        </div>
      </td>
    </tr>
  );
}

function CreateUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("vertrieb");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      try {
        await createUser({ email, password, fullName, role });
        toast.success("Nutzer angelegt");
        setEmail("");
        setPassword("");
        setFullName("");
        setRole("vertrieb");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="label-caps mb-3">Neuen Nutzer anlegen</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="E-Mail"
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Passwort (min. 8)"
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Name (optional)"
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="vertrieb">Vertrieb</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="focus-ring mt-3 rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
      >
        {pending ? "Legt an…" : "Anlegen"}
      </button>
    </div>
  );
}
