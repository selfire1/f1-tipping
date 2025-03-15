import { eq } from "drizzle-orm";
import { resultsTable } from "~~/server/db/schema";
import { getResultOptions } from "~~/shared/schemas";

export default defineAuthedEventHandler(async (event) => {
  const { raceId } = await getValidatedQuery(event, getResultOptions.parse);

  const items = await db.query.resultsTable.findMany({
    ...(raceId
      ? {
          where: eq(resultsTable.raceId, raceId),
        }
      : {}),
  });

  return {
    items,
  };
});
