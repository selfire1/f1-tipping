import { readFile } from "fs/promises";
import { DRIVERS_CACHE_PATH } from "~~/server/consts";
import { Driver } from "~~/types";

export default defineEventHandler(async (_event): Promise<Driver[]> => {
  const drivers = await readFile(DRIVERS_CACHE_PATH, { encoding: "utf8" });
  return JSON.parse(drivers);
});
