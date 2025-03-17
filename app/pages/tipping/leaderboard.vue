<script setup lang="ts">
import type { z } from "zod";
import type { getResultOptions } from "~~/shared/schemas";
import type { RacePredictionField } from "~~/types";
import { Database } from "~~/types/db";

definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Results",
  ogTitle: "Results",
});

const query: z.infer<typeof getResultOptions> = {
  raceId: "albert_park",
};
const { data: results, status: resultsStatus } = await useFetch(
  "/api/results",
  {
    query,
    ...$getCachedFetchConfig("results"),
    transform(results) {
      if (!results?.items?.length) {
        return;
      }
      // const resultsMap =
      const resultsMap = results.items.reduce((acc, driverResult) => {
        const mapped: Database.Result = {
          ...driverResult,
          updatedAt: new Date(driverResult.updatedAt),
          addedAt: new Date(driverResult.updatedAt),
        };

        if (driverResult.grid === 1) {
          acc.set("pole", mapped);
        }
        const didNotFinish = driverResult.position === null;
        if (didNotFinish) {
          console.log("did not finish", driverResult.position);
          return acc;
        }
        if (driverResult.position === 1) {
          acc.set("p1", mapped);
        }
        if (driverResult.position === 10) {
          acc.set("p10", mapped);
        }
        const currentLast = acc.get("last");
        if (!currentLast) {
          acc.set("last", mapped);
          return acc;
        }
        if ((driverResult.position ?? 0) > (currentLast.position ?? Infinity)) {
          acc.set("last", mapped);
        }
        return acc;
      }, new Map<RacePredictionField, Database.Result>());
      // Aggregate points by constructor
      const constructorPoints = results.items?.reduce(
        (acc, { constructorId, points }) => {
          if (!acc[constructorId]) acc[constructorId] = 0;
          acc[constructorId] += points;
          return acc;
        },
        {} as Record<Database.Result["constructorId"], number>,
      );

      // Find the maximum points
      const maxPoints = Math.max(...Object.values(constructorPoints));

      // Find the constructors with the maximum points
      const topConstructors = Object.entries(constructorPoints)
        .filter(([_, points]) => points === maxPoints)
        .map(([constructorId, points]) => ({
          constructorId,
          points,
        }));
      return {
        topConstructors,
        drivers: resultsMap,
      };
    },
  },
);

const { currentUserGroup } = await useGroup();
const { reduceIntoObject } = usePrediction();
const { data: predictions, status: predictionStatus } = await useFetch(
  `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    lazy: true,
    query: {
      entireGroup: true,
      raceId: "albert_park", // TODO: make dynamic/iterate over all races
    },
    ...$getCachedFetchConfig("all predictions"),
    transform: (entries) => {
      return reduceIntoObject(entries);
    },
  },
);

const predictionsAndResults = computed(() => {
  return RACE_PREDICTION_FIELDS.map((predictionKey) => {
    const predictionEntries = predictions.value?.[predictionKey];
    const isForConstructor = predictionKey === "constructorWithMostPoints";
    const result = isForConstructor
      ? results.value?.topConstructors
      : results.value?.drivers?.get(predictionKey);

    const predictionResults = predictionEntries?.map((entry) => {
      const prediction = entry.value;
      if (!prediction) {
        return {
          user: entry.userName,
        };
      }
      const isForConstructor = !("familyName" in prediction);
      const isCorrect = isForConstructor
        ? // @ts-expect-error TODO: fix type error
          result?.some(({ constructorId }) => constructorId === prediction.id)
        : results.value?.drivers?.get(predictionKey)?.driverId ===
          prediction.id;

      return {
        user: entry.userName,
        prediction,
        type: isForConstructor ? "constructor" : "driver",
        isCorrect,
        id: entry.id,
      };
    });
    return {
      label: RACE_KEYS_TO_LABEL[predictionKey],
      id: predictionKey,
      predictionResults,
      result: {
        value: result,
        type: isForConstructor ? "constructors" : "driver",
      },
    };
  });
});

const leaderboard = computed(() => {
  const predictionResults = predictionsAndResults.value?.flatMap(
    (el) => el.predictionResults,
  );
  const pointsMap = predictionResults.reduce((acc, entry) => {
    if (!entry) {
      return acc;
    }
    const { isCorrect, user } = entry;
    const points = isCorrect ? 1 : 0;
    if (!acc.has(user)) {
      acc.set(user, points);
      return acc;
    }
    // @ts-expect-error Checked if user exists
    acc.set(user, points + acc.get(user));
    return acc;
  }, new Map<string, number>());
  return [...pointsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([user, points], index) => ({
      id: user,
      name: user,
      points,
      place: index + 1,
    }));
});
const columns = [
  {
    key: "place",
    label: "",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "points",
    label: "Points",
  },
];
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Results
  .is-page-height.is-container.space-y-12
    template(v-if="['pending', 'idle'].includes(resultsStatus) || ['pending', 'idle'].includes(predictionStatus)")
      .space-y-12
        USkeleton.w-full.h-60
        .space-y-4
          template(v-for="i in 6" :key='i')
            USkeleton.w-full.h-12
    template(v-else-if="!results")
      .text-center.py-4
        h2.is-display-6 No results available
        p.text-muted Please check back later.
    template(v-else)
      UCard
        template(#header)
          h2.is-display-6 Leaderboard
        UTable(:columns :rows="leaderboard")
          template(#place-data=" { row }")
            p {{ row.place + "." }}
      section.space-y-6
        TextHero(:level="2" heading="Races")
        div.space-y-6
          TextHero(:level="3" heading="Albert Park")
          .space-y-4
            template(v-for="entries in predictionsAndResults" :key='entries.id')
              div
                TextHero(:level="4" :heading="entries.label")
                .divide-y
                  template(v-for="entry in entries.predictionResults?.toSorted((a,b)=> a.user.localeCompare(b.user))" :key='entry.id')
                    .gap-2.items-center.grid.grid-cols-12(:class="entry.isCorrect ? 'font-medium' : 'opacity-50'")
                        UIcon.col-span-1(:name="entry.isCorrect ? 'carbon:checkmark-filled' : 'carbon:close'" :class="entry.isCorrect ? 'text-green-600' : 'text-red-300'")
                        p.col-span-5 {{ entry.user }}
                        .col-span-6
                          template(v-if="!entry.prediction")
                            p No prediction
                          template(v-else-if="entry.type === 'driver'")
                            DriverOption(:option="entry.prediction")
                          template(v-else-if="entry.type === 'constructor'")
                            ConstructorOption(:option="entry.prediction")
</template>
