import { eq } from "drizzle-orm";
import { resultsTable } from "~~/server/db/schema";
import { getResultOptions } from "~~/shared/schemas";

export default defineBasicAuthedEventHandler(async (event) => {
  const { race } = await getValidatedQuery(event, getResultOptions.parse);

  const items = await db.query.resultsTable.findMany({
    ...(race?.id
      ? {
          where: eq(resultsTable.raceId, race.id),
        }
      : {}),
    columns: {
      driverId: true,
      constructorId: true,
      grid: true,
      position: true,
      points: true,
      status: true,
      raceId: true,
    },
  });

  return {
    items,
  };
});
