import { groupMembersTable } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { defineAuthedEventHandler } from '~~/server/utils/handlers'

export default defineAuthedEventHandler(async (event) => {
  const session = event.context.auth
  const targetUserId = event.context.auth.user.id

  if (!targetUserId) {
    throw createError({ statusMessage: 'Bad Request', statusCode: 400 })
  }

  if (session.user.id !== targetUserId) {
    // only allow users to get their own groups
    throw createError({ statusMessage: 'Unauthorized', statusCode: 401 })
  }
  //
  const groupsOfUser = await db.query.groupMembersTable.findMany({
    columns: {
      id: true,
      joinedAt: true,
    },
    where: eq(groupMembersTable.userId, targetUserId),
    with: {
      group: true,
    },
  })

  return {
    items: groupsOfUser,
  }
})
