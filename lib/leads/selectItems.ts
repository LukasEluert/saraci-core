export type RefOption = { id: string; name: string; slug?: string | null };

export type SelectItemOption = { value: string; label: string };

/** value = UUID, label = Anzeigename (für Base UI Select `items`). */
export function refSelectItemsById(
  options: RefOption[],
  config?: { includeNone?: boolean; noneLabel?: string }
): SelectItemOption[] {
  const includeNone = config?.includeNone !== false;
  const items: SelectItemOption[] = [];

  if (includeNone) {
    items.push({ value: "none", label: config?.noneLabel ?? "—" });
  }

  for (const option of options) {
    items.push({ value: option.id, label: option.name });
  }

  return items;
}

/** value = slug (Fallback id), label = Anzeigename. */
export function refSelectItemsBySlug(options: RefOption[]): SelectItemOption[] {
  return options.map((option) => ({
    value: option.slug ?? option.id,
    label: option.name,
  }));
}

export function labeledSelectItems(
  entries: ReadonlyArray<{ value: string; label: string }>
): SelectItemOption[] {
  return entries.map((e) => ({ value: e.value, label: e.label }));
}
