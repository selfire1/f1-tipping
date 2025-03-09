import { setTimeout } from "timers/promises";
import { resultsTable } from "~~/server/db/schema";
import type { Database } from "~~/types/db";
import type { ResultsResponse } from "~~/types/ergast";

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");

  let offset = 0;
  let total: null | number = null;
  const limit = 100;

  let results: Database.InsertResult[] = [];

  const circuitsThisYear = (
    await db.query.racesTable.findMany({
      columns: {
        circuitName: true,
      },
    })
  ).map((race) => race.circuitName);

  const driversThisYear = (
    await db.query.driversTable.findMany({
      columns: {
        id: true,
      },
    })
  ).map((driver) => driver.id);

  while (total === null || offset < total) {
    console.log({ total, offset });
    const response = await fetchJolpica<ResultsResponse>(
      `/ergast/f1/2025/results/`,
      { params: { limit, offset } },
    );
    total = +response.MRData.total;
    offset += limit;
    const races = response.MRData.RaceTable?.Races;
    if (!races?.length) {
      continue;
    }
    results.push(
      ...races.flatMap((race) => {
        return race.Results.map((result) => {
          if (!result.Constructor) {
            console.warn("No constructor", result);
            throw createError({
              statusCode: 404,
              statusMessage: "No Constructor found",
            });
          }
          if (!result.status) {
            throw createError({
              statusCode: 404,
              statusMessage: "No Status found",
            });
          }

          return {
            raceId: race.Circuit.circuitId,
            driverId: result.Driver.driverId,
            constructorId: result.Constructor?.constructorId,
            grid: result.grid ? +result.grid : null,
            position: +result.position,
            points: +result.points,
            status: result.status,
          };
        }).filter(Boolean);
      }),
    );

    await setTimeout(1000); // NOTE: to keep within API burst limit
  }

  await db.delete(resultsTable); // reset table
  const returning = await db.insert(resultsTable).values(results).returning({
    id: resultsTable.id,
  });

  return {
    data: {
      received: results.length,
      updated: returning.length,
    },
  };
});
