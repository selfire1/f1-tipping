import { subMinutes } from 'date-fns'
import type { Database } from '~~/types/db'

export function $getCutoffDate(
  race: Pick<Database.Race, 'cutoffDateRaw'>,
  cutoffMinutes: Database.Group['cutoffInMinutes'] = DEFAULT_CUTOFF_MINS,
): Date {
  const rawCutoffDate = race.cutoffDateRaw
  const lastChanceToEnterTips = subMinutes(rawCutoffDate, cutoffMinutes)
  return lastChanceToEnterTips
}
