"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createLeadNote,
  deleteLeadNote,
  updateLeadNote,
} from "@/app/actions/leadNotes";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { formatDateTime } from "@/lib/leads/format";
import type { LeadNote } from "@/lib/akquise/leadNotes";

const INPUT_CLASS =
  "focus-ring w-full resize-y rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]";

function NoteEntry({
  note,
  leadId,
  canEdit,
}: {
  note: LeadNote;
  leadId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.inhalt);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Notiz darf nicht leer sein.");
      return;
    }
    startTransition(async () => {
      try {
        await updateLeadNote({ id: note.id, leadId, inhalt: trimmed });
        toast.success("Notiz aktualisiert");
        setEditing(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Konnte nicht speichern.");
      }
    });
  };

  const cancel = () => {
    setText(note.inhalt);
    setEditing(false);
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-[var(--text-tertiary)]">
          <span className="font-medium text-[var(--text-secondary)]">
            {note.author_name}
          </span>
          {" · "}
          {formatDateTime(note.created_at)}
        </p>
        {canEdit && !editing && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(true)}
              className="focus-ring text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              Bearbeiten
            </button>
            <ConfirmButton
              triggerLabel="Notiz loeschen"
              triggerClassName="focus-ring text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40"
              title="Notiz loeschen?"
              description="Diese Notiz wird dauerhaft entfernt."
              confirmLabel="Loeschen"
              successMessage="Notiz geloescht"
              onConfirm={() => deleteLeadNote(note.id, leadId)}
              onDone={() => router.refresh()}
            >
              Loeschen
            </ConfirmButton>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className={INPUT_CLASS}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="focus-ring rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
            >
              {pending ? "Speichert…" : "Speichern"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={cancel}
              className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-[var(--text-primary)]">
          {note.inhalt}
        </p>
      )}
    </div>
  );
}

export function LeadNotes({
  leadId,
  notes,
  currentUserId,
  isAdmin,
}: {
  leadId: string;
  notes: LeadNote[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newNote, setNewNote] = useState("");

  const add = () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        await createLeadNote({ leadId, inhalt: trimmed });
        toast.success("Notiz hinzugefuegt");
        setNewNote("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Konnte nicht speichern.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {notes.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Noch keine Notizen.</p>
      ) : (
        notes.map((note) => (
          <NoteEntry
            key={note.id}
            note={note}
            leadId={leadId}
            canEdit={isAdmin || note.user_id === currentUserId}
          />
        ))
      )}

      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)]/50 p-3">
        <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">
          Neue Notiz hinzufuegen
        </label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          placeholder="Kontext, Gespraechsnotizen, naechste Schritte…"
          className={INPUT_CLASS}
        />
        <button
          type="button"
          disabled={pending || !newNote.trim()}
          onClick={add}
          className="focus-ring mt-2 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
        >
          {pending ? "Speichert…" : "Notiz hinzufuegen"}
        </button>
      </div>
    </div>
  );
}
