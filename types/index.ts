import type { RACE_PREDICTION_FIELDS } from "~~/shared/utils/consts";
export * as Component from "./components";

export type Driver = {
  id: string;
  permanentNumber: string;
  fullName: string;
  givenName: string;
  familyName: string;
  nationality: string;
  constructor: Constructor;
};

export type Constructor = {
  id?: string;
  name?: string;
  nationality?: string;
};

export type PredictionField = (typeof PREDICTION_FIELDS)[number];
export type RacePredictionField = (typeof RACE_PREDICTION_FIELDS)[number];
