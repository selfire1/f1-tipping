import { eq } from 'drizzle-orm'
import { resultsTable } from '~~/server/db/schema'
import { getResultOptions } from '~~/shared/schemas'

export default defineAuthedEventHandler(async (event) => {
  const { raceId } = await getValidatedQuery(event, getResultOptions.parse)

  const items = await db.query.resultsTable.findMany({
    with: {
      driver: {
        columns: {
          id: true,
          constructorId: true,
          givenName: true,
          familyName: true,
        },
      },
      constructor: {
        id: true,
        name: true,
      },
    },
    ...(raceId
      ? {
          where: eq(resultsTable.raceId, raceId),
        }
      : {}),
  })

  return {
    items,
  }
})
