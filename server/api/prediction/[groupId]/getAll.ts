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
import { subMinutes } from 'date-fns'

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const db = useDb()

  // Get the id of the group for which we want to get predicions
  const { groupId } = await getValidatedRouterParams(
    event,
    z.object({
      groupId: z.string(),
    }).parse,
  )

  // Get ids of races that are after the cutof to tip. This way predictions stay secret until no one can tip anymore
  const idsOfRacesAfterCutoff = await getRacesThatAreAfterCutoff(groupId)

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
        inArray(predictionsTable.raceId, idsOfRacesAfterCutoff),
      ),
    )

  return predictionEntries

  async function getRacesThatAreAfterCutoff(groupId: string) {
    const group = await db.query.groupsTable.findFirst({
      where: eq(groupsTable.id, groupId),
      columns: {
        cutoffInMinutes: true,
      },
    })

    const cutoffInMinutes = group?.cutoffInMinutes || DEFAULT_CUTOFF_MINS
    const currentDate = new Date()
    const currentDateWithCutoffAdjusted = subMinutes(
      currentDate,
      cutoffInMinutes,
    )
    const raceIds = (
      await db.query.racesTable.findMany({
        where: lt(racesTable.qualifyingDate, currentDateWithCutoffAdjusted),
        columns: {
          id: true,
        },
      })
    ).map((race) => race.id)
    return raceIds
  }
})
