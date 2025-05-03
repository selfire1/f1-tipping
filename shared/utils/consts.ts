import type { RacePredictionField } from '~~/types'
import type { Database } from '~~/types/db'

export const DRIVER_RACE_PREDICTION_FIELDS = [
  'sprintP1',
  'pole',
  'p1',
  'p10',
  'last',
] as const

export const CONSTRUCTOR_RACE_PREDICTION_FIELDS = [
  'constructorWithMostPoints',
] as const

export const RACE_PREDICTION_FIELDS = [
  ...DRIVER_RACE_PREDICTION_FIELDS,
  ...CONSTRUCTOR_RACE_PREDICTION_FIELDS,
] as const

export const CHAMPIONSHIP_PREDICTION_FIELDS = [
  'championshipConstructor',
  'championshipDriver',
] as const

export const PREDICTION_FIELDS = [
  ...RACE_PREDICTION_FIELDS,
  ...CHAMPIONSHIP_PREDICTION_FIELDS,
] as const

export const DEFAULT_CUTOFF_MINS = 180

export const CUTOFF_REFERENCE_KEY = {
  pole: 'qualifyingDate',
  p1: 'qualifyingDate',
  p10: 'qualifyingDate',
  last: 'qualifyingDate',
  sprintP1: 'sprintQualifyingDate',
  constructorWithMostPoints: 'qualifyingDate',
} as const satisfies Record<RacePredictionField, keyof Database.Race>
