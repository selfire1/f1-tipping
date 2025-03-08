import getConstructors from "~~/server/api/constructors/get";
import { writeFileSync } from "fs";
import { setTimeout } from "timers/promises";
import { DRIVERS_CACHE_PATH } from "~~/server/consts";
import { fetchJolpica } from "~~/server/utils";
import { Driver } from "~~/types";
import * as Ergast from "~~/types/ergast";

export default defineEventHandler(async (event) => {
  const constructors = await getConstructors(event);
  let drivers: Driver[] = [];

  for await (const constructor of constructors) {
    setTimeout(1000); // NOTE: to keep within burst limit
    if (!constructor.id) {
      console.warn("No id for", constructor);
      continue;
    }

    const {
      MRData: {
        DriverTable: { Drivers: apiDrivers },
      },
    } = await fetchJolpica<Ergast.DriverResponse>(
      `/ergast/f1/2025/constructors/${constructor.id}/drivers/`,
    );
    if (!apiDrivers?.length) {
      continue;
    }
    drivers.push(
      ...apiDrivers.map(
        (driver): Driver => ({
          id: driver.driverId,
          permanentNumber: driver.permanentNumber,
          fullName: driver.givenName + " " + driver.familyName,
          givenName: driver.givenName,
          familyName: driver.familyName,
          nationality: driver.nationality,
          constructor,
        }),
      ),
    );
  }

  writeFileSync(DRIVERS_CACHE_PATH, JSON.stringify(drivers, null, 2));
  setResponseStatus(event, 204);
  return null;
});
