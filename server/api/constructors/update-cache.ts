import { writeFileSync } from "fs";
import { CONSTRUCTORS_CACHE_PATH } from "~~/server/consts";
import { fetchErgast } from "~~/server/utils";
import { Constructor } from "~~/types";
import * as Ergast from "~~/types/ergast";

export default defineEventHandler(async (event) => {
  const {
    MRData: {
      ConstructorTable: { Constructors: apiConstructors },
    },
  } = await fetchErgast<Ergast.ConstructorsResponse>(
    "/ergast/f1/2025/constructors/",
  );
  const constructors: Constructor[] = apiConstructors.map((constructor) => ({
    id: constructor.constructorId,
    name: constructor.name,
    nationality: constructor.nationality,
  }));

  writeFileSync(CONSTRUCTORS_CACHE_PATH, JSON.stringify(constructors, null, 2));
  setResponseStatus(event, 204);
  return null;
});
