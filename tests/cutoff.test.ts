import { it, expect, describe } from 'vitest'
import { useCutoff } from '../app/composables/useCutoff'
import { add } from 'date-fns'

const given = {
  race: {
    id: 'miami',
    locality: 'Miami',
    grandPrixDate: new Date('2025-05-04T20:00:00.000Z'),
    qualifyingDate: new Date('2025-05-03T20:00:00.000Z'),
    sprintDate: new Date('2025-05-03T16:00:00.000Z'),
    sprintQualifyingDate: new Date('2025-05-02T20:30:00.000Z'),
  },
  currentUserGroup: {
    cutoffInMinutes: 0,
  },
}

describe('is race after cutoff', () => {
  const { getIsRaceFullyAfterCutoff } = useCutoff({
    race: given.race,
    group: given.currentUserGroup,
  })

  it('is not after cutoff when nothing has started', () => {
    const result = getIsRaceFullyAfterCutoff(
      new Date('2025-04-27T12:43:42+1000'),
    )
    expect(result).toBe(false)
  })
  it('is not after cutoff after sprint qualy has started', () => {
    const result = getIsRaceFullyAfterCutoff(
      justAfter(given.race.sprintQualifyingDate),
    )
    expect(result).toBe(false)
  })
  it('is after cutoff after the last position field has started', () => {
    const result = getIsRaceFullyAfterCutoff(
      justAfter(given.race.qualifyingDate),
    )
    expect(result).toBe(true)
  })
})

describe('is position', () => {
  const { isPositionAfterCutoff } = useCutoff({
    race: given.race,
    group: given.currentUserGroup,
  })

  it('has not `p1` as after cutoff', () => {
    const result = isPositionAfterCutoff(
      'p1',
      new Date('2025-04-27T13:12:13+1000'),
    )
    expect(result).toBe(false)
  })
  it('has no keys after cutoff', () => {
    for (const position of RACE_PREDICTION_FIELDS) {
      // @ts-ignore
      const result = isPositionAfterCutoff(
        position,
        new Date('2025-04-27T13:12:22+1000'),
      )
      expect(result, 'position: ' + position).toBe(false)
    }
  })
  it('return sprint as after cutoff once sprint qualifying started', () => {
    const result = isPositionAfterCutoff(
      'sprintP1',
      justAfter(given.race.sprintDate),
    )
    expect(result).toBe(true)
  })
  it('return p1 as after cutoff once GP qualifying started', () => {
    const result = isPositionAfterCutoff(
      'pole',
      justAfter(given.race.qualifyingDate),
    )
    expect(result).toBe(true)
  })
})

function justAfter(date: Date) {
  return add(date, { minutes: 1 })
}
