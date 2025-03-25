import { and, eq } from 'drizzle-orm'
import {
  groupMembersTable,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from '~~/server/db/schema'
import { serverSaveChampionships } from '~~/shared/schemas'
import { $getCutoffDate } from '~~/shared/utils'
import { Database } from '~~/types/db'

export default defineAuthedEventHandler(async (event) => {
  const timeOfSubmission = new Date()
  assertMethod(event, 'POST')
  const body = await readValidatedBody(event, serverSaveChampionships.parse)

  const { currentGroup, currentGroupMembership } = await getCurrentGroupOfUser()

  const isAfterCutoffDate = await getIfPredictionIsAfterCutoffDate()

  if (isAfterCutoffDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too late to tip',
    })
  }

  const existingPrediction = await db.query.predictionsTable.findFirst({
    where: and(
      eq(predictionsTable.userId, event.context.auth.user.id),
      eq(predictionsTable.isForChampionship, true),
      eq(predictionsTable.groupId, currentGroupMembership.group.id),
    ),
    columns: {
      id: true,
    },
  })
  if (existingPrediction) {
    await updatePredictionEntries(existingPrediction.id)
    setResponseStatus(event, 200)
    return {
      items: [],
      mode: 'update',
    }
  }

  const entries = await createPrediction()
  setResponseStatus(event, 201)

  return {
    items: entries,
    mode: 'save',
  }

  async function updatePredictionEntries(
    predictionId: Database.Prediction['id'],
  ) {
    const values: Database.InsertPredictionEntry[] = [
      {
        predictionId,
        position: 'championshipConstructor',
        constructorId: body.championshipConstructor.id,
      },
      {
        predictionId,
        position: 'championshipDriver',
        driverId: body.championshipDriver.id,
      },
    ]
    for await (const value of values) {
      if (!value.predictionId) {
        continue
      }
      await db
        .update(predictionEntriesTable)
        .set({
          constructorId: value.constructorId,
          driverId: value.driverId,
        })
        .where(
          and(
            eq(predictionEntriesTable.predictionId, value.predictionId),
            eq(predictionEntriesTable.position, value.position),
          ),
        )
    }
  }

  async function createPrediction() {
    const [{ id: predictionId }] = await db
      .insert(predictionsTable)
      .values([
        {
          userId: event.context.auth.user.id,
          groupId: currentGroupMembership.group.id,
          isForChampionship: true,
        },
      ])
      .returning({ id: predictionsTable.id })

    const entries = await db
      .insert(predictionEntriesTable)
      .values([
        {
          predictionId,
          position: 'championshipConstructor',
          constructorId: body.championshipConstructor.id,
        },
        {
          predictionId,
          position: 'championshipDriver',
          driverId: body.championshipDriver.id,
        },
      ])
      .returning()
    return entries
  }

  async function getIfPredictionIsAfterCutoffDate() {
    const firstRace = await db.query.racesTable.findFirst({
      where: eq(racesTable.round, 1),
    })

    if (!firstRace) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No races found',
      })
    }

    const cutoffDate = $getCutoffDate(
      firstRace.qualifyingDate,
      currentGroup.cutoffInMinutes,
    )
    return timeOfSubmission > cutoffDate
  }

  async function getCurrentGroupOfUser() {
    const userIsMember = eq(
      groupMembersTable.userId,
      event.context.auth.user.id,
    )
    const givenGroupIdIsDbGroupId = eq(groupMembersTable.groupId, body.group.id)
    const currentGroupMembership = await db.query.groupMembersTable.findFirst({
      columns: {
        id: true,
      },
      where: and(userIsMember, givenGroupIdIsDbGroupId),
      with: {
        group: {
          columns: {
            id: true,
            cutoffInMinutes: true,
          },
        },
      },
    })

    const currentGroup = currentGroupMembership?.group
    if (!currentGroup) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid group',
      })
    }
    return { currentGroup, currentGroupMembership }
  }
})
