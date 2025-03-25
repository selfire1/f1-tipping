import { eq } from 'drizzle-orm'
import z from 'zod'
import { groupsTable } from '~~/server/db/schema'
export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse,
  )

  return {
    item: await db.query.groupsTable.findFirst({
      where: eq(groupsTable.id, id),
    }),
  }
})
