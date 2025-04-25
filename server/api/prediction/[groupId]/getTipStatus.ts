import { and, eq, inArray, lt } from 'drizzle-orm'
import {
  groupMembersTable,
  groupsTable,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from '~~/server/db/schema'
import z from 'zod'
import { useDb } from '~~/server/utils/db'
import { User } from 'better-auth'

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const db = useDb()
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  )
  const { raceId } = await getValidatedQuery(
    event,
    z.object({
      raceId: z.string(),
    }).parse,
  )

  const usersOfGroup = await db.query.groupMembersTable.findMany({
    where: eq(groupMembersTable.groupId, groupId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    columns: {
      // @ts-expect-error
      user: true,
    },
  })

  const predictionsForRace = await db.query.predictionsTable.findMany({
    where: and(
      eq(predictionsTable.groupId, groupId),
      eq(predictionsTable.raceId, raceId),
    ),
    columns: {
      userId: true,
    },
  })

  const userIdsWhoPredicted = new Set()

  predictionsForRace.forEach((prediction) => {
    userIdsWhoPredicted.add(prediction.userId)
  })

  const splitUsers = usersOfGroup.reduce(
    (acc, entry) => {
      // @ts-expect-error
      const user = entry.user
      if (userIdsWhoPredicted.has(user.id)) {
        acc.tipped.push(user)
        return acc
      }
      acc.notTipped.push(user)
      return acc
    },
    {
      tipped: [],
      notTipped: [],
    } as Record<'tipped' | 'notTipped', Pick<User, 'id' | 'name' | 'image'>[]>,
  )

  return {
    usersByStatus: splitUsers,
  }
})
