import { z } from "zod";

export const createGroup = z.object({
  name: z.string().min(1, "Required"),
});

const requiredString = z.string().min(1, "Required");
const idObject = z
  .object({
    id: requiredString,
  })
  .passthrough();

export const saveTip = z.object({
  pole: idObject,
  p1: idObject,
  p10: idObject,
  last: idObject,
  constructorWithMostPoints: idObject,
});

export const saveChampionships = z.object({
  championshipConstructor: idObject,
  championshipDriver: idObject,
});

export const serverSaveChampionships = saveChampionships.extend({
  group: idObject,
});

export const serverSaveTip = saveTip.extend({
  race: idObject,
  group: idObject,
});

export const getResultOptions = z.object({
  race: idObject.optional(),
});
