export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, 'GET')
  return {
    items: await db.query.racesTable.findMany({
      orderBy: (race) => race.round,
    }),
  }
})
