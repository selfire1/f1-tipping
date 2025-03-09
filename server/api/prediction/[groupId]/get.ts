import { and, eq, inArray } from "drizzle-orm";
import {
  predictionEntriesTable,
  predictionsTable,
  Race,
} from "~~/server/db/schema";
import z from "zod";

export default defineAuthedEventHandler(async (event) => {
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  );

  assertMethod(event, "GET");

  const predictionEntries = await db.query.predictionEntriesTable.findMany({
    where: inArray(
      predictionEntriesTable.predictionId,
      db
        .select({ id: predictionsTable.id })
        .from(predictionsTable)
        .where(
          and(
            eq(predictionsTable.userId, event.context.auth.user.id),
            eq(predictionsTable.groupId, groupId),
          ),
        ),
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
});
