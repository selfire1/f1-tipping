import { sql } from 'drizzle-orm'
import { constructorsTable } from '~~/server/db/schema'
import { fetchJolpica } from '~~/server/utils'
import { useDb } from '~~/server/utils/db'
import { defineBasicAuthedEventHandler } from '~~/server/utils/handlers'
import { ConstructorsResponse } from '~~/types/ergast'

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const db = useDb()
  const response = await fetchJolpica<ConstructorsResponse>(
    '/ergast/f1/2025/constructors/',
  )
  const constructors = response.MRData.ConstructorTable.Constructors
  if (!constructors?.length) {
    throw createError({ statusCode: 404, statusMessage: 'No Drivers found' })
  }
  const returning = await db
    .insert(constructorsTable)
    .values(
      constructors.map((constructor) => {
        if (!constructor.constructorId) {
          throw createError({
            statusCode: 404,
            statusMessage: 'No constructorId included',
          })
        }
        return {
          id: constructor.constructorId,
          name: constructor.name,
          nationality: constructor.nationality ?? '',
          lastUpdated: new Date(),
        }
      }),
    )
    .onConflictDoUpdate({
      target: constructorsTable.id,
      set: {
        name: sql`excluded.name`,
        nationality: sql`excluded.nationality`,
        lastUpdated: sql`excluded.last_updated`,
      },
    })

    .returning({
      id: constructorsTable.id,
    })

  setResponseStatus(event, 201)

  return {
    data: {
      received: response.MRData.total,
      updated: returning.length,
    },
  }
})
