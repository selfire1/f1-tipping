import type { RacePredictionField } from '~~/types'
import type { Database } from '~~/types/db'
import { isAfter, subMinutes } from 'date-fns'
import { CUTOFF_REFERENCE_KEY } from '~~/shared/utils/consts'

type Value = (typeof CUTOFF_REFERENCE_KEY)[keyof typeof CUTOFF_REFERENCE_KEY]
type RaceWithCutoffDates = Pick<Database.Race, Value>

export const useCutoff = (context: {
  race: RaceWithCutoffDates & Pick<Database.Race, 'id'>
  group: Pick<Database.Group, 'cutoffInMinutes'>
}) => {
  const {
    race: ctxRace,
    group: { cutoffInMinutes: ctxCutoffInMinutes = DEFAULT_CUTOFF_MINS },
  } = context

  function getCutoffDateForPosition(
    position: RacePredictionField,
  ): Date | null {
    const rawCutoffDate = ctxRace[CUTOFF_REFERENCE_KEY[position]]
    if (!rawCutoffDate) {
      return null
    }
    const lastChanceToEnterTips = subMinutes(rawCutoffDate, ctxCutoffInMinutes)
    return lastChanceToEnterTips
  }

  function isPositionAfterCutoff(
    position: RacePredictionField,
    testDate: Date = new Date(),
  ): boolean {
    const cutoffDate = getCutoffDateForPosition(position)
    if (!cutoffDate) {
      // if none provided, it's treated as being after the cutoff
      return true
    }
    return isAfter(testDate, cutoffDate)
  }

  function getPositionWhereCutoffDateIsLast(
    fieldsToConsider: RacePredictionField[] = [...RACE_PREDICTION_FIELDS],
  ): RacePredictionField {
    const latestPosition = fieldsToConsider.reduce((previous, current) => {
      const positionDate = ctxRace[CUTOFF_REFERENCE_KEY[current]]
      if (!positionDate) return previous

      const previousPositionDate = ctxRace[CUTOFF_REFERENCE_KEY[previous]]!

      const isBigger = isAfter(positionDate, previousPositionDate)
      if (!isBigger) return previous
      return current
    }, fieldsToConsider[0] as RacePredictionField)
    return latestPosition
  }

  /**
   * Returns if the race is fully after the specified cutoff date.
   */
  function getIsRaceFullyAfterCutoff(
    testDate: Date = new Date(),
    options: {
      fieldsToCheck: RacePredictionField[]
    } = { fieldsToCheck: [...RACE_PREDICTION_FIELDS] },
  ): boolean {
    const { fieldsToCheck } = options
    const latestPosition = getPositionWhereCutoffDateIsLast(fieldsToCheck)
    return isPositionAfterCutoff(latestPosition, testDate)
  }

  return {
    getIsRaceFullyAfterCutoff,
    isPositionAfterCutoff,
    getCutoffDateForPosition,
  }
}
