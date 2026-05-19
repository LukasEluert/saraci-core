import { createAdminClient } from "@/lib/supabase/admin";

export async function emitCoreEvent(args: {
  type: string;
  source_id?: string | null;
  source_label?: string | null;
  task_text?: string | null;
  metadata?: Record<string, unknown>;
  processed?: boolean;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("core_events").insert({
    type: args.type,
    source_id: args.source_id ?? null,
    source_label: args.source_label ?? null,
    task_text: args.task_text ?? null,
    metadata: args.metadata ?? null,
    processed: args.processed ?? false,
  });

  if (error) {
    console.error(`[events] ${args.type}:`, error.message);
  }
}

export async function emitCheckRequested(leadId: string, url: string): Promise<void> {
  await emitCoreEvent({
    type: "lead.check_requested",
    source_id: leadId,
    source_label: url,
    task_text: "Website-Check angefordert",
    metadata: { lead_id: leadId, url },
    processed: false,
  });
}

export async function emitLeadQualified(leadId: string, firma: string | null): Promise<void> {
  await emitCoreEvent({
    type: "lead.qualified",
    source_id: leadId,
    source_label: firma ?? leadId,
    task_text: "Lead als qualifiziert markiert",
    metadata: { lead_id: leadId },
    processed: true,
  });
}
