export const DRIVER_RACE_PREDICTION_FIELDS = [
  'pole',
  'p1',
  'p10',
  'last',
  'sprintP1',
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
