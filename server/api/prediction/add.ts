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
import { conflictUpdateAllExcept, useDb } from '~~/server/utils/db'
import {
  CUTOFF_REFERENCE_KEY,
  DRIVER_RACE_PREDICTION_FIELDS,
} from '~~/shared/utils/consts'
import { useCutoff } from '~/composables/useCutoff'
import { z } from 'zod'

export default defineAuthedEventHandler(async (event) => {
  const db = useDb()
  const timeOfSubmission = new Date()
  assertMethod(event, 'POST')
  const body = await readValidatedBody(event, schema.server.parse)
  if (!body) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid body',
    })
  }
  const { currentGroup, currentGroupMembership } = await getCurrentGroupOfUser()

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

  const positionPredictions = existingPrediction?.id
    ? await db.query.predictionEntriesTable.findMany({
        where: and(
          eq(predictionEntriesTable.predictionId, existingPrediction.id),
        ),
        columns: {
          position: true,
          driverId: true,
          constructorId: true,
        },
      })
    : []

  const raceBeingPredicted = await getRaceFromId(body.race.id)
  throwIfAnyNewFieldIsAfterCutoff(
    raceBeingPredicted,
    timeOfSubmission,
    body,
    currentGroup,
    positionPredictions,
  )

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
    await db
      .insert(predictionEntriesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [
          predictionEntriesTable.predictionId,
          predictionEntriesTable.position,
        ],
        set: conflictUpdateAllExcept(predictionEntriesTable, [
          'id',
          'predictionId',
          'position',
          'createdAt',
        ]),
      })
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

  function throwIfAnyNewFieldIsAfterCutoff(
    targetRace: Awaited<ReturnType<typeof getRaceFromId>>,
    timeOfSubmission: Date,
    body: z.infer<typeof schema.server>,
    group: Pick<Database.Group, 'cutoffInMinutes'>,
    existingEntries?: Pick<
      Database.PredictionEntry,
      'position' | 'driverId' | 'constructorId'
    >[],
  ) {
    const { isPositionAfterCutoff: getIsPositionAfterCutoff } = useCutoff({
      race: targetRace,
      group,
    })

    const positionsPredicted = Object.keys(body) as RacePredictionField[]
    const isNewPrediction = !existingEntries?.length
    const existingPredictionValuesMap = existingEntries?.reduce(
      (acc, entry) => {
        // @ts-ignore
        if (!RACE_PREDICTION_FIELDS.includes(entry.position)) {
          return acc
        }
        acc[entry.position as RacePredictionField] =
          entry.driverId || entry.constructorId
        return acc
      },
      {} as Record<
        RacePredictionField,
        | Database.PredictionEntry['constructorId']
        | Database.PredictionEntry['driverId']
      >,
    )

    for (const position of positionsPredicted) {
      const isPositionAfterCutoff = getIsPositionAfterCutoff(
        position,
        timeOfSubmission,
      )
      if (isNewPrediction && isPositionAfterCutoff) {
        console.warn('Is a new prediction and is after cutoff')
        throwError(position)
      }

      const wasPreviouslySaved = existingPredictionValuesMap?.[position]
      const isChanged =
        wasPreviouslySaved &&
        existingPredictionValuesMap[position] !== body[position]?.id
      if (isChanged && isPositionAfterCutoff) {
        console.warn('Has changed and is after cutoff', {
          existing: existingPredictionValuesMap,
          body,
        })
        throwError(position)
      }
    }
    function throwError(position: RacePredictionField) {
      throw createError({
        statusCode: 422,
        statusMessage: `Cannot predict ${position} after cutoff`,
      })
    }
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
