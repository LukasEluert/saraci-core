import { normalizeUrl } from "@/lib/core/checks/normalizeUrl";

export function normalizeWebsiteUrl(
  input: string
): { url: string; normalized: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return normalizeUrl(trimmed);
  } catch {
    return null;
  }
}
