import { driversTable } from "~~/server/db/schema";
import { fetchJolpica } from "~~/server/utils";
import { defineBasicAuthedEventHandler } from "~~/server/utils/handlers";
import { DriverResponse } from "~~/types/ergast";
import { setTimeout } from "timers/promises";
import { Database } from "~~/types/db";

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");

  const constructors = await db.query.constructorsTable.findMany({
    columns: {
      id: true,
    },
  });

  const drivers: Database.InsertDriver[] = [];

  for await (const constructor of constructors) {
    setTimeout(1000); // NOTE: to keep within API burst limit

    const {
      MRData: {
        DriverTable: { Drivers: apiDrivers },
      },
    } = await fetchJolpica<DriverResponse>(
      `/ergast/f1/2025/constructors/${constructor.id}/drivers/`,
    );
    if (!apiDrivers?.length) {
      continue;
    }

    drivers.push(
      ...apiDrivers.map(
        (driver): Database.InsertDriver => ({
          id: driver.driverId,
          permanentNumber: driver.permanentNumber,
          fullName: driver.givenName + " " + driver.familyName,
          givenName: driver.givenName,
          familyName: driver.familyName,
          nationality: driver.nationality,
          constructorId: constructor.id,
        }),
      ),
    );
  }

  const returning = await db.insert(driversTable).values(drivers).returning({
    id: driversTable.id,
  });

  setResponseStatus(event, 201);

  return {
    data: {
      updated: returning.length,
    },
  };
});
