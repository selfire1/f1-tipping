import { subMinutes } from 'date-fns'
import type { Database } from '~~/types/db'

export const DEFAULT_CUTOFF_MINS = 180

export function $getCutoffDate(
  qualifyingDate: Database.Race['qualifyingDate'],
  cutoff: Database.Group['cutoffInMinutes'] = DEFAULT_CUTOFF_MINS,
): Date {
  const cutoffInMinutes = cutoff
  const qualifyingStart = qualifyingDate
  const lastChanceToEnterTips = subMinutes(qualifyingStart, cutoffInMinutes)
  return lastChanceToEnterTips
}
