export default defineAuthedEventHandler(async (_event) => {
  return {
    items: await db.query.racesTable.findMany(),
  };
});
