import { subMinutes } from "date-fns";
import type { Database } from "~~/types/db";

export function $getCutoffDate(
  qualifyingDate: Database.Race["qualifyingDate"],
  cutoff: Database.Group["cutoffInMinutes"] = 180,
): Date {
  const cutoffInMinutes = cutoff;
  const qualifyingStart = qualifyingDate;
  const lastChanceToEnterTips = subMinutes(qualifyingStart, cutoffInMinutes);
  return lastChanceToEnterTips;
}
