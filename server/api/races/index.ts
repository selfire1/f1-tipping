import { useDb } from '~~/server/utils/db'

export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const db = useDb()
  return {
    items: await db.query.racesTable.findMany({
      orderBy: (race) => race.round,
    }),
  }
})
