import { constructorsTable } from "~~/server/db/schema";
import { fetchJolpica } from "~~/server/utils";
import { defineBasicAuthedEventHandler } from "~~/server/utils/handlers";
import { ConstructorsResponse } from "~~/types/ergast";

export default defineBasicAuthedEventHandler(async (event) => {
  assertMethod(event, "GET");
  const response = await fetchJolpica<ConstructorsResponse>(
    "/ergast/f1/2025/constructors/",
  );
  const constructors = response.MRData.ConstructorTable.Constructors;
  if (!constructors?.length) {
    throw createError({ statusCode: 404, statusMessage: "No Drivers found" });
  }
  const returning = await db
    .insert(constructorsTable)
    .values(
      constructors.map((constructor) => {
        if (!constructor.constructorId) {
          throw createError({
            statusCode: 404,
            statusMessage: "No constructorId included",
          });
        }
        return {
          id: constructor.constructorId,
          name: constructor.name,
          nationality: constructor.nationality ?? "",
        };
      }),
    )
    .returning({
      id: constructorsTable.id,
    });

  setResponseStatus(event, 201);

  return {
    data: {
      received: response.MRData.total,
      updated: returning.length,
    },
  };
});
