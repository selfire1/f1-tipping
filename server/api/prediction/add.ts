import { and, eq } from "drizzle-orm";
import {
  groupMembersTable,
  predictionEntriesTable,
  predictionsTable,
  racesTable,
} from "~~/server/db/schema";
import { serverSaveTipp } from "~~/shared/schemas";
import { getCutoffDate } from "~~/shared/utils";
import { Constructor, Driver } from "~~/types";
import { Database } from "~~/types/db";

export default defineAuthedEventHandler(async (event) => {
  const timeOfSubmission = new Date();
  assertMethod(event, "POST");
  const body = await readValidatedBody(event, serverSaveTipp.parse);

  const { currentGroup, currentGroupMembership } =
    await getCurrentGroupOfUser();

  const isAfterCutoffDate = await getIfPredictionIsAfterCutoffDate();
  if (isAfterCutoffDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Too late to tip",
    });
  }

  await checkIfSuppliedIdsAreValid();
  //
  // TODO: check if the user already has predictions for this race

  const entries = await savePrediction();
  setResponseStatus(event, 201);

  return {
    items: entries,
  };

  async function savePrediction() {
    const [{ id: predictionId }] = await db
      .insert(predictionsTable)
      .values([
        {
          userId: event.context.auth.user.id,
          groupId: currentGroupMembership.group.id,
          raceId: body.race.id,
        },
      ])
      .returning({ id: predictionsTable.id });
    const driverPredictionEntryKeys: Database.InsertPredictionEntry["position"][] =
      ["pole", "p1", "p10", "last"];
    const driverPredictionEntries = driverPredictionEntryKeys.map((entry) => ({
      predictionId,
      position: entry,
      driverId: body[entry].id,
    }));

    const entries = await db
      .insert(predictionEntriesTable)
      .values([
        ...driverPredictionEntries,
        {
          predictionId: predictionId,
          position: "constructorWithMostPoints",
          constructorId: body.constructorWithMostPoints.id,
        },
      ])
      .returning();
    return entries;
  }

  async function checkIfSuppliedIdsAreValid() {
    const drivers = await db.query.driversTable.findMany({
      columns: {
        id: true,
        constructorId: true,
      },
    });
    const { constructorIds, driverIds } = drivers.reduce(
      (acc, el) => {
        acc.constructorIds.push(el.constructorId);
        acc.driverIds.push(el.id);
        return acc;
      },
      {
        constructorIds: [] as Constructor["id"][],
        driverIds: [] as Driver["id"][],
      },
    );

    const driverKeys = ["p1", "pole", "last", "p10"] as const;
    const constructorKeys = ["constructorWithMostPoints"] as const;

    driverKeys.forEach((key) => {
      const givenId = body[key].id;
      if (givenId && !driverIds.includes(givenId)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid driver",
        });
      }
    });

    constructorKeys.forEach((key) => {
      const givenId = body[key].id;
      if (givenId && !constructorIds.includes(givenId)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid constructor",
        });
      }
    });
  }

  async function getIfPredictionIsAfterCutoffDate() {
    const targetRace = await db.query.racesTable.findFirst({
      where: eq(racesTable.id, body.race.id),
      columns: {
        id: true,
        qualifyingDate: true,
      },
    });

    if (!targetRace) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid race",
      });
    }

    const cutoffDate = getCutoffDate(
      targetRace.qualifyingDate,
      currentGroup.cutoffInMinutes,
    );
    return timeOfSubmission > cutoffDate;
  }

  async function getCurrentGroupOfUser() {
    const userIsMember = eq(
      groupMembersTable.userId,
      event.context.auth.user.id,
    );
    const givenGroupIdIsDbGroupId = eq(
      groupMembersTable.groupId,
      body.group.id,
    );
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
    });

    const currentGroup = currentGroupMembership?.group;
    if (!currentGroup) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid group",
      });
    }
    return { currentGroup, currentGroupMembership };
  }
});
