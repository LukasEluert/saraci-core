"use server";

import { runWebsiteCheck } from "@/lib/core/checks";
import type { WebsiteCheckInput, WebsiteCheckResult } from "@/lib/core/checks";

export async function runWebsiteCheckAction(
  input: WebsiteCheckInput
): Promise<WebsiteCheckResult> {
  return runWebsiteCheck(input);
}
