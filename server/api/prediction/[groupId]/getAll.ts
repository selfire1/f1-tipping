import { and, eq, inArray, lt } from 'drizzle-orm'
import {
  groupsTable,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from '~~/server/db/schema'
import z from 'zod'
import { DEFAULT_CUTOFF_MINS } from '~~/shared/utils/consts'
import { useDb } from '~~/server/utils/db'

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const db = useDb()
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  )

  const group = await db.query.groupsTable.findFirst({
    where: eq(groupsTable.id, groupId),
    columns: {
      cutoffInMinutes: true,
    },
  })
  const cutoffInMinutes = group?.cutoffInMinutes || DEFAULT_CUTOFF_MINS
  const cutoffDate = $getCutoffDate(
    { cutoffDateRaw: new Date() },
    cutoffInMinutes,
  )

  const raceIds = (
    await db.query.racesTable.findMany({
      where: lt(racesTable.qualifyingDate, cutoffDate),
      columns: {
        id: true,
      },
    })
  ).map((race) => race.id)

  const predictionEntries = await db
    .select({
      id: predictionEntriesTable.id,
      userId: predictionsTable.userId,
      raceId: predictionsTable.raceId,
      position: predictionEntriesTable.position,
      driverId: predictionEntriesTable.driverId,
      constructorId: predictionEntriesTable.constructorId,
    })
    .from(predictionsTable)
    .leftJoin(
      predictionEntriesTable,
      eq(predictionsTable.id, predictionEntriesTable.predictionId),
    )
    .where(
      and(
        eq(predictionsTable.groupId, groupId),
        inArray(predictionsTable.raceId, raceIds),
      ),
    )

  return predictionEntries
})
