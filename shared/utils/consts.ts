export const RACE_PREDICTION_FIELDS = [
  'pole',
  'p1',
  'p10',
  'last',
  'constructorWithMostPoints',
  'sprintP1',
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
