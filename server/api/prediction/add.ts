import { and, eq } from 'drizzle-orm'
import {
  groupMembersTable,
  InsertPredictionEntry,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from '~~/server/db/schema'
import { saveTip as schema } from '~~/shared/schemas'
import { Constructor, Driver, RacePredictionField } from '~~/types'
import { Database } from '~~/types/db'
import { useDb } from '~~/server/utils/db'
import {
  CUTOFF_REFERENCE_KEY,
  DRIVER_RACE_PREDICTION_FIELDS,
} from '~~/shared/utils/consts'
import { useCutoff } from '~/composables/useCutoff'

export default defineAuthedEventHandler(async (event) => {
  const db = useDb()
  const timeOfSubmission = new Date()
  assertMethod(event, 'POST')
  const body = await readValidatedBody(event, schema.server.parse)
  if (!body) {
    return
  }

  const { currentGroup, currentGroupMembership } = await getCurrentGroupOfUser()
  const raceBeingPredicted = await getRaceFromId(body.race.id)

  const { getIsRaceFullyAfterCutoff } = useCutoff({
    race: raceBeingPredicted,
    group: currentGroup,
  })

  const fieldsToCheck = Object.keys(body).filter(
    // @ts-expect-error key body error
    (key) => body?.[key] && DRIVER_RACE_PREDICTION_FIELDS.includes(key as any),
  ) as RacePredictionField[]
  const isAfterCutoffDate = getIsRaceFullyAfterCutoff(timeOfSubmission, {
    fieldsToCheck,
  })
  if (isAfterCutoffDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too late to tip',
    })
  }

  await checkIfSuppliedIdsAreValid()

  const existingPrediction = await db.query.predictionsTable.findFirst({
    where: and(
      eq(predictionsTable.userId, event.context.auth.user.id),
      eq(predictionsTable.raceId, body.race.id),
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
    const values = getValues(predictionId)
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
          raceId: body.race.id,
        },
      ])
      .returning({ id: predictionsTable.id })

    const values = getValues(predictionId)

    const entries = await db
      .insert(predictionEntriesTable)
      .values(values)
      .returning()
    return entries
  }

  function getValues(
    predictionId: Database.Prediction['id'],
  ): InsertPredictionEntry[] {
    const driverPredictionEntries: InsertPredictionEntry[] = [
      ...DRIVER_RACE_PREDICTION_FIELDS,
    ].reduce((acc, entry) => {
      const id = body[entry]?.id
      if (!id) {
        return acc
      }
      acc.push({ predictionId, position: entry, driverId: id })
      return acc
    }, [] as InsertPredictionEntry[])

    const constructorPredictionEntries: InsertPredictionEntry[] = [
      ...CONSTRUCTOR_RACE_PREDICTION_FIELDS,
    ].reduce((acc, entry) => {
      const id = body[entry]?.id
      if (!id) {
        return acc
      }
      acc.push({ predictionId, position: entry, constructorId: id })
      return acc
    }, [] as InsertPredictionEntry[])

    const values: InsertPredictionEntry[] = [
      ...driverPredictionEntries,
      ...constructorPredictionEntries,
    ]
    return values
  }

  async function checkIfSuppliedIdsAreValid() {
    const drivers = await db.query.driversTable.findMany({
      columns: {
        id: true,
        constructorId: true,
      },
    })
    const { constructorIds, driverIds } = drivers.reduce(
      (acc, el) => {
        acc.constructorIds.push(el.constructorId)
        acc.driverIds.push(el.id)
        return acc
      },
      {
        constructorIds: [] as Constructor['id'][],
        driverIds: [] as Driver['id'][],
      },
    )

    const driverKeys = DRIVER_RACE_PREDICTION_FIELDS
    const constructorKeys = ['constructorWithMostPoints'] as const

    driverKeys.forEach((key) => {
      const givenId = body[key]?.id
      if (givenId && !driverIds.includes(givenId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid driver',
        })
      }
    })

    constructorKeys.forEach((key) => {
      const givenId = body[key]?.id
      if (givenId && !constructorIds.includes(givenId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid constructor',
        })
      }
    })
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

  async function getRaceFromId(targetId: string) {
    const keysToGetCutoffInfo = [
      ...new Set(Object.values(CUTOFF_REFERENCE_KEY)),
    ]
    const keysToGetCutoffInfoAsObject = keysToGetCutoffInfo.reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as Record<(typeof keysToGetCutoffInfo)[number], true>,
    )
    const targetRace = await db.query.racesTable.findFirst({
      where: eq(racesTable.id, targetId),
      columns: {
        id: true,
        sprintDate: true,
        ...keysToGetCutoffInfoAsObject,
      },
    })
    if (!targetRace) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid race',
      })
    }
    return targetRace
  }
})
