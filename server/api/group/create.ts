import { groupMembersTable, groupsTable } from "~~/server/db/schema";
import { defineAuthedEventHandler } from "~~/server/utils/handlers";
import { createGroup as createGroupSchema } from "~~/shared/schemas";

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, "POST");
  const { data } = await readValidatedBody(event, createGroupSchema.safeParse);
  const {
    context: {
      auth: { user },
    },
  } = event;
  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid data",
    });
  }

  const [{ id: groupId }] = await db
    .insert(groupsTable)
    .values({
      name: data.name,
      createdByUser: user.id,
    })
    .returning({ id: groupsTable.id });

  await db.insert(groupMembersTable).values({
    groupId,
    userId: user.id,
  });
  return {
    item: {
      id: groupId,
    },
  };
});
