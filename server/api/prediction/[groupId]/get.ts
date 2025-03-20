import { and, eq, inArray } from "drizzle-orm";
import {
  groupsTable,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from "~~/server/db/schema";
import z from "zod";
import { DEFAULT_CUTOFF_MINS } from "~~/shared/utils";
import { isFuture } from "date-fns";

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  );

  const query = await getValidatedQuery(
    event,
    z.object({
      /**
       * race id or "championships"
       */
      raceId: z.string().optional(),
      entireGroup: z
        .preprocess((val) => val === "true", z.boolean())
        .default(false),
    }).parse,
  );

  if (query.entireGroup && !query.raceId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "You can only get entire group predictions when specifying a race.",
    });
  }

  if (query.entireGroup && query.raceId) {
    const group = await db.query.groupsTable.findFirst({
      where: eq(groupsTable.id, groupId),
      columns: {
        cutoffInMinutes: true,
      },
    });
    const cutoffInMinutes = group?.cutoffInMinutes || DEFAULT_CUTOFF_MINS;
    const race = await db.query.racesTable.findFirst({
      where: eq(racesTable.id, query.raceId),
    });
    if (!race?.qualifyingDate) {
      throw createError({
        statusCode: 404,
        statusMessage: "No qualifying date found for race",
      });
    }
    const cutoffDate = $getCutoffDate(race?.qualifyingDate, cutoffInMinutes);
    if (isFuture(cutoffDate)) {
      throw createError({
        statusMessage: "Cutoff is in the future.",
        statusCode: 400,
      });
    }
  }

  const whereQuery = getSubqueryCondition(query.raceId);

  const predictionEntries = await db.query.predictionEntriesTable.findMany({
    where: inArray(
      predictionEntriesTable.predictionId,
      db
        .select({ id: predictionsTable.id })
        .from(predictionsTable)
        .where(whereQuery),
    ),
    with: {
      prediction: {
        columns: {
          raceId: true,
        },
        ...(query.entireGroup
          ? {
              with: {
                user: {
                  columns: {
                    name: true,
                  },
                },
              },
            }
          : {}),
      },
      driver: {
        columns: {
          constructorId: true,
          givenName: true,
          familyName: true,
          id: true,
        },
      },
      constructor: true,
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
    const targetUserQuery = query.entireGroup
      ? undefined
      : conditions.isForCurrentUser;
    if (targetRaceId === "championships") {
      return and(
        targetUserQuery,
        conditions.isForSuppliedGroup,
        conditions.onlyChampionship,
      );
    }

    if (targetRaceId) {
      return and(
        targetUserQuery,
        conditions.isForSuppliedGroup,
        eq(predictionsTable.raceId, targetRaceId),
      );
    }
    return and(conditions.isForCurrentUser, conditions.isForSuppliedGroup);
  }
});
