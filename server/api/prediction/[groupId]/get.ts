import { and, eq, inArray } from "drizzle-orm";
import { predictionEntriesTable, predictionsTable } from "~~/server/db/schema";
import z from "zod";

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  );

  const { raceId = "" } = await getValidatedQuery(
    event,
    z.object({
      /**
       * race id or "championships"
       */
      raceId: z.string().optional(),
    }).parse,
  );

  const whereQuery = getSubqueryCondition(raceId);

  const predictionEntries = await db.query.predictionEntriesTable.findMany({
    where: inArray(
      predictionEntriesTable.predictionId,
      db
        .select({ id: predictionsTable.id })
        .from(predictionsTable)
        .where(whereQuery),
    ),
    // @ts-expect-error TODO: fix type error
    with: {
      prediction: {
        columns: {
          raceId: true,
        },
      },
    },
  });

  return predictionEntries;

  // helper methods

  function getSubqueryCondition(targetRaceId?: string) {
    const conditions = {
      isForCurrentUser: eq(predictionsTable.userId, event.context.auth.user.id),
      isForSuppliedGroup: eq(predictionsTable.groupId, groupId),
      onlyChampionship: eq(predictionsTable.isForChampionship, true),
    };
    if (targetRaceId === "championships") {
      return and(
        conditions.isForCurrentUser,
        conditions.isForSuppliedGroup,
        conditions.onlyChampionship,
      );
    }

    if (targetRaceId) {
      return and(
        conditions.isForCurrentUser,
        conditions.isForSuppliedGroup,
        eq(predictionsTable.raceId, targetRaceId),
      );
    }
    return and(conditions.isForCurrentUser, conditions.isForSuppliedGroup);
  }
});
