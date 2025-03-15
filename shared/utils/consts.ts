export const RACE_PREDICTION_FIELDS = [
  "pole",
  "p1",
  "p10",
  "last",
  "constructorWithMostPoints",
] as const;

export const CHAMPIONSHIP_PREDICTION_FIELDS = [
  "championshipConstructor",
  "championshipDriver",
] as const;
export const PREDICTION_FIELDS = [
  ...RACE_PREDICTION_FIELDS,
  CHAMPIONSHIP_PREDICTION_FIELDS,
] as const;
