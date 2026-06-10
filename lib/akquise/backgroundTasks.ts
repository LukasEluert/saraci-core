import "server-only";
import { ensureAutoArchive } from "./autoArchive";
import { ensureFollowUps } from "./followUp";

export async function ensureBackgroundTasks(): Promise<{
  followUpUpdated: number;
  autoArchived: number;
}> {
  const [followUp, archive] = await Promise.all([
    ensureFollowUps(),
    ensureAutoArchive(),
  ]);

  return {
    followUpUpdated: followUp.updated,
    autoArchived: archive.archived,
  };
}
