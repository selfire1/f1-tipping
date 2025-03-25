import { sql } from 'drizzle-orm'
import { racesTable } from '~~/server/db/schema'
import { fetchJolpica } from '~~/server/utils'
import { defineBasicAuthedEventHandler } from '~~/server/utils/handlers'
import { RaceResponse } from '~~/types/ergast'

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const response = await fetchJolpica<RaceResponse>('/ergast/f1/2025/races/')
  const races = response.MRData.RaceTable?.Races
  if (!races?.length) {
    throw createError({ statusCode: 404, statusMessage: 'No Races found' })
  }
  const returning = await db
    .insert(racesTable)
    .values(
      races.map((race) => {
        if (!race.Qualifying) {
          throw createError({
            statusCode: 404,
            statusMessage: 'No Qualifying found',
          })
        }
        return {
          id: race.Circuit.circuitId,
          country: race.Circuit.Location.country,
          round: +race.round,
          circuitName: race.Circuit.circuitName,
          raceName: race.raceName,
          grandPrixDate: new Date(`${race.date}T${race.time}`),
          qualifyingDate: new Date(
            `${race.Qualifying.date}T${race.Qualifying.time}`,
          ),
          locality: race.Circuit.Location.locality,
          lastUpdated: new Date(),
        }
      }),
    )
    .onConflictDoUpdate({
      target: racesTable.id,
      set: {
        country: sql`excluded.country`,
        round: sql`excluded.round`,
        circuitName: sql`excluded.circuit_name`,
        raceName: sql`excluded.race_name`,
        grandPrixDate: sql`excluded.grand_prix_date`,
        qualifyingDate: sql`excluded.qualifying_date`,
        locality: sql`excluded.locality`,
        lastUpdated: sql`excluded.last_updated`,
      },
    })
    .returning({
      id: racesTable.id,
    })

  setResponseStatus(event, 201)

  return {
    data: {
      received: response.MRData.total,
      updated: returning.length,
    },
  }
})
