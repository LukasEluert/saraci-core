/** Lead ist Lukas zugewiesen → „In Arbeit“-Badge in Listen. */
export function isLeadInArbeit(
  assignedTo: string | null | undefined,
  adminUserId: string
): boolean {
  if (!assignedTo) return false;
  return String(assignedTo).trim() === String(adminUserId).trim();
}
