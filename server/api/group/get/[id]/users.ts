import { eq } from "drizzle-orm";
import z from "zod";
import { groupMembersTable } from "~~/server/db/schema";
export default defineEventHandler(async (event) => {
  assertMethod(event, "GET");
  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse,
  );

  return {
    items: (
      await db.query.groupMembersTable.findMany({
        where: eq(groupMembersTable.groupId, id),
        with: {
          user: true,
        },
      })
    ).map((entry) => entry.user),
  };
});
