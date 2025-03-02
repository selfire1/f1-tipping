import { readFile } from "fs/promises";
import { CONSTRUCTORS_CACHE_PATH } from "~~/server/consts";
import { Constructor } from "~~/types";

export default defineEventHandler(async (_event): Promise<Constructor[]> => {
  const constructors = await readFile(CONSTRUCTORS_CACHE_PATH, {
    encoding: "utf8",
  });
  return JSON.parse(constructors);
});
