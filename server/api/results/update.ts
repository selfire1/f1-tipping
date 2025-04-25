import { setTimeout } from 'timers/promises'
import { InsertResult, resultsTable } from '~~/server/db/schema'
import type { Database } from '~~/types/db'
import type { ResultsResponse, SprintResultsResponse } from '~~/types/ergast'
import { useDb } from '~~/server/utils/db'

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')

  const db = useDb()

  const sprintResultsMap = await getSprintResultsMap()
  await waitToAvoidRateLimit()
  const results = await getResults(sprintResultsMap)

  if (!results.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No results found',
    })
  }

  await db.delete(resultsTable) // reset table
  const returning = await db.insert(resultsTable).values(results).returning({
    id: resultsTable.id,
  })

  return {
    data: {
      received: results.length,
      updated: returning.length,
    },
  }

  async function getResults(sprintResultsMap: SprintResultsMap) {
    let results: Database.InsertResult[] = []
    let offset = 0
    let total: null | number = null
    const limit = 100
    while (total === null || offset < total) {
      const response = await fetchJolpica<ResultsResponse>(
        `/ergast/f1/2025/results/`,
        { params: { limit, offset } },
      )
      total = +response.MRData.total
      offset += limit
      const races = response.MRData.RaceTable?.Races
      if (!races?.length) {
        continue
      }
      results.push(
        ...races.flatMap((race) => {
          return race.Results.map((result) => {
            if (!result.Constructor) {
              console.warn('No constructor', result)
              throw createError({
                statusCode: 404,
                statusMessage: 'No Constructor found',
              })
            }
            if (!result.status) {
              throw createError({
                statusCode: 404,
                statusMessage: 'No Status found',
              })
            }

            const raceId = race.Circuit.circuitId
            const driverId = result.Driver.driverId
            const sprintPosition = sprintResultsMap.get(raceId)?.get(driverId)

            const item: InsertResult = {
              raceId,
              driverId,
              sprint: sprintPosition,
              constructorId: result.Constructor.constructorId,
              grid: result.grid ? +result.grid : null,
              position: isNaN(parseInt(result.positionText))
                ? null
                : +result.positionText,
              points: +result.points,
              status: result.status,
            }
            return item
          }).filter(Boolean)
        }),
      )

      await waitToAvoidRateLimit()
    }

    return results
  }

  type SprintResultsMap = Map<
    Database.Race['id'],
    Map<Database.Driver['id'], number | null>
  >
  async function getSprintResultsMap(): Promise<SprintResultsMap> {
    let offset = 0
    let total: null | number = null
    const limit = 100

    const sprintResultsMap = new Map() as SprintResultsMap

    while (total === null || offset < total) {
      const response = await fetchJolpica<SprintResultsResponse>(
        `/ergast/f1/2025/sprint/`,
        { params: { limit, offset } },
      )
      total = +response.MRData.total
      offset += limit

      const races = response.MRData.RaceTable?.Races
      if (!races?.length) {
        continue
      }
      for (const race of races) {
        const raceId = race.Circuit.circuitId
        const resultsMap = new Map()
        for (const result of race.SprintResults) {
          const driverId = result.Driver.driverId
          const position = result.position
          resultsMap.set(driverId, position)
        }
        sprintResultsMap.set(raceId, resultsMap)
      }
      await waitToAvoidRateLimit()
    }
    return sprintResultsMap
  }

  async function waitToAvoidRateLimit(ms = 1000) {
    await setTimeout(ms) // NOTE: to keep within API burst limit
  }
})
