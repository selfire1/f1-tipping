export default defineAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");
  return {
    items: await db.query.driversTable.findMany(),
  };
});
