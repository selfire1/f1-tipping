import { writeFileSync } from "fs";
import { setTimeout } from "timers/promises";
import { DRIVERS_CACHE_PATH } from "~~/server/consts";
import { fetchErgast } from "~~/server/utils";
import { Constructor, Driver } from "~~/types";
import * as Ergast from "~~/types/ergast";

export default defineEventHandler(async (event) => {
  const {
    MRData: {
      ConstructorTable: { Constructors: constructors },
    },
  } = await fetchErgast<Ergast.ConstructorsResponse>(
    "/ergast/f1/2025/constructors/",
  );
  let drivers: Array<Driver> = [];

  for await (const constructor of constructors) {
    setTimeout(1000); // NOTE: to keep within burst limit
    if (!constructor.constructorId) {
      console.warn("No id for", constructor);
      continue;
    }

    const {
      MRData: {
        DriverTable: { Drivers: apiDrivers },
      },
    } = await fetchErgast<Ergast.DriverResponse>(
      `/ergast/f1/2025/constructors/${constructor.constructorId}/drivers/`,
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
          constructor: {
            id: constructor.constructorId,
            name: constructor.name,
            nationality: constructor.nationality,
          },
        }),
      ),
    );
  }

  writeFileSync(DRIVERS_CACHE_PATH, JSON.stringify(drivers, null, 2));
  setResponseStatus(event, 204);
  return null;
});
