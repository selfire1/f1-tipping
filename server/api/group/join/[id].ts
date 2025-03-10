import { and, eq } from "drizzle-orm";
import z from "zod";
import { groupMembersTable } from "~~/server/db/schema";

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, "POST");
  const { id: targetID } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse,
  );

  const doesExist = await db.query.groupMembersTable.findFirst({
    where: and(
      eq(groupMembersTable.groupId, targetID),
      eq(groupMembersTable.userId, event.context.auth.user.id),
    ),
    columns: {
      id: true,
    },
  });

  if (doesExist) {
    throw createError({
      statusCode: 400,
      statusMessage: "Already joined",
    });
  }

  const [insertedItem] = await db
    .insert(groupMembersTable)
    .values([
      {
        groupId: targetID,
        userId: event.context.auth.user.id,
      },
    ])
    .returning({ id: groupMembersTable.id });
  return {
    item: insertedItem,
  };
});
