<script setup lang="ts">
import ConstructorOption from "~/components/ConstructorOption.vue";
import type { Component } from "~~/types";
import { Database } from "~~/types/db";

definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Results",
  ogTitle: "Results",
});

const { data: constructorsMap, status: constructorsStatus } =
  await useLazyFetch("/api/constructors", {
    ...$getCachedFetchConfig("constructors"),
    transform(data) {
      const constructors = data.items;
      return constructors.reduce((acc, constructor) => {
        acc.set(constructor.id, constructor);
        return acc;
      }, new Map<Database.Constructor["id"], Database.Constructor>());
    },
  });

const { data: results, status: resultsStatus } = await useLazyFetch(
  "/api/results",
  {
    ...$getCachedFetchConfig("results"),
    transform(results) {
      if (!results?.items?.length) {
        return;
      }

      const resultsMap = new Map<
        Database.Race["id"],
        {
          qualifying: Map<number, Component.DriverOption>;
          gp: Map<number, Component.DriverOption>;
          allConstructorsPoints: Map<Database.Result["constructorId"], number>;
          topConstructorsPoints: Map<Database.Result["constructorId"], number>;
        }
      >();
      results.items.forEach((result) => {
        const isRaceInMap = resultsMap.has(result.raceId);
        if (!isRaceInMap) {
          resultsMap.set(result.raceId, {
            // driverPositions: new Map<RacePredictionField, Database.Result>(),
            allConstructorsPoints: new Map<
              Database.Constructor["id"],
              number
            >(),
            topConstructorsPoints: new Map<
              Database.Constructor["id"],
              number
            >(),
            qualifying: new Map<number, Component.DriverOption>(),
            gp: new Map<number, Component.DriverOption>(),
          });
        }

        const raceObj = resultsMap.get(result.raceId);
        // @ts-expect-error
        raceObj!.qualifying.set(result.grid ?? 0, result.driver ?? {});
        if (result.position && result.position > 0) {
          // @ts-expect-error
          raceObj!.gp.set(result.position, result.driver ?? {});
        }

        const constructorsMap = raceObj!.allConstructorsPoints;
        if (!constructorsMap.has(result.constructorId)) {
          constructorsMap.set(result.constructorId, 0);
        }
        const currentConstructorPoints =
          constructorsMap.get(result.constructorId)! + result.points;
        constructorsMap.set(result.constructorId, currentConstructorPoints);

        const topConstructors = raceObj!.topConstructorsPoints;

        const currentMaxPoints = Math.max(...constructorsMap.values());
        if (currentConstructorPoints >= currentMaxPoints) {
          topConstructors.set(result.constructorId, currentConstructorPoints);
          topConstructors.forEach((value, key) => {
            if (value < currentConstructorPoints) {
              topConstructors.delete(key);
            }
          });
        }
      });
      return resultsMap;
    },
  },
);

const { data: races, status: racesStatus } = await useFetch("/api/races", {
  ...$getCachedFetchConfig("races"),
});

const racesWithResults = computed(() => {
  return races.value?.items
    ?.filter((race) => results.value?.has(race.id))
    ?.sort((a, b) => b.round - a.round);
});

const selectedIndex = ref(0);
const selectedRace = computed(() => {
  return (
    racesWithResults.value?.[selectedIndex.value] ?? races.value?.items?.[0]
  );
});

function goPrevious() {
  selectedIndex.value = Math.max(0, selectedIndex.value - 1);
}
function goNext() {
  selectedIndex.value = Math.min(
    racesWithResults.value?.length ?? 0,
    selectedIndex.value + 1,
  );
}

const { currentUserGroup } = await useGroup();
const { data: currentRacePredictions, status: predictionStatus } =
  await useFetch(`/api/prediction/${currentUserGroup.value?.id}/get`, {
    query: {
      entireGroup: true,
      raceId: selectedRace.value?.id,
    },
    ...$getCachedFetchConfig("all predictions"),
  });

const { data: allPredictions } = await useFetch(
  `/api/prediction/${currentUserGroup.value?.id}/getAll`,
  {
    ...$getCachedFetchConfig("allPredictions"),
  },
);

const { data: groupMembers } = await useFetch(
  `/api/group/get/${currentUserGroup.value?.id}/users`,
  {
    ...$getCachedFetchConfig("groupMembers"),
    transform: (data) => data.items,
  },
);

const leaderboard = computed(() => {
  const membersMap = groupMembers.value?.reduce((map, user) => {
    map.set(user.id, {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      points: 0,
    });
    return map;
  }, new Map<Database.User["id"], Database.User & { points: number }>());
  const resultsMap = results.value;
  if (!resultsMap) {
    console.warn("No results");
    return [];
  }

  const increaseUserPoints = (id: string) => {
    if (!membersMap?.has(id)) {
      return;
    }
    const currentValue = membersMap.get(id);
    if (!currentValue) {
      return;
    }
    membersMap.set(id, {
      ...currentValue,
      points: currentValue.points + 1,
    });
  };

  allPredictions.value?.forEach(
    ({ position, driverId, constructorId, raceId, userId }) => {
      if (!raceId) {
        console.warn("No race id");
        return;
      }
      const raceMap = resultsMap.get(raceId);
      if (!raceMap) {
        console.info("No race map");
        return;
      }
      if (position === "constructorWithMostPoints") {
        const isCorrect = raceMap.topConstructorsPoints.has(
          constructorId ?? "",
        );
        if (!isCorrect) {
          return;
        }
        increaseUserPoints(userId);
        return;
      }
      const result = (() => {
        switch (position) {
          case "p1":
            return raceMap.gp.get(1);
          case "pole":
            return raceMap.qualifying.get(1);
          case "p10":
            return raceMap.gp.get(10);
          case "last":
            const sorted = [...raceMap.gp.entries()].sort(
              (a, b) => (a[0] || Infinity) - (b[0] || Infinity),
            );
            const [lastPlacePosition] = sorted.at(-1) ?? [1];
            return raceMap.gp.get(lastPlacePosition);
        }
      })();
      const isCorrect = result && result.id === driverId;
      if (!isCorrect) {
        return;
      }
      increaseUserPoints(userId);
    },
  );

  if (!membersMap) {
    return [];
  }
  return [...membersMap.entries()]
    .map(([_userId, userInfo]) => {
      const { points, ...info } = userInfo;
      return { points, user: info };
    })
    .sort(
      (a, b) => b.points - a.points || a.user.name.localeCompare(b.user.name),
    );
});

const leaderboardColumns = [
  {
    key: "points",
    label: "Points",
  },
  {
    key: "user",
    label: "Name",
  },
];

const qualifyingResults = computed(() => {
  if (!selectedRace.value) {
    return [];
  }
  const map = results.value?.get(selectedRace.value.id)?.qualifying;
  if (!map) {
    return [];
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([place, driver]) => {
      const predictedP1By = predictionsByUser.value
        ?.get(driver.id)
        ?.get("pole");
      return {
        place,
        driver,
        predictedP1By,
        isP1Correct:
          place === 1 &&
          results.value?.get(selectedRace.value!.id)?.gp?.get(1)?.id ===
            driver.id,
      };
    })
    .filter((el) => el.place === 1 || el.predictedP1By?.length);
});

const gpResults = computed(() => {
  if (!selectedRace.value) {
    return;
  }
  const map = results.value?.get(selectedRace.value.id)?.gp;
  if (!map) {
    return [];
  }
  const sorted = [...map.entries()].sort(
    (a, b) => (a[0] || Infinity) - (b[0] || Infinity),
  );
  const [lastPlacePosition] = sorted.at(-1) ?? [1];
  return sorted.map(([place, driver]) => {
    const predictedP1By = predictionsByUser.value?.get(driver.id)?.get("p1");
    const predictedP10By = predictionsByUser.value?.get(driver.id)?.get("p10");
    const predictedLast = predictionsByUser.value?.get(driver.id)?.get("last");
    return {
      place,
      driver,
      predictedP1By,
      predictedP10By,
      predictedLast,
      didAnyonePredict: [predictedP1By, predictedP10By, predictedLast].some(
        (el) => el?.length,
      ),
      isP1Correct:
        place === 1 &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(1)?.id ===
          driver.id,
      isP10Correct:
        place === 10 &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(10)?.id ===
          driver.id,
      isLastCorrect:
        place === lastPlacePosition &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(lastPlacePosition)
          ?.id === driver.id,
    };
  });
});

const constructorResults = computed(() => {
  if (!selectedRace.value) {
    return;
  }
  const map = results.value?.get(selectedRace.value.id)?.allConstructorsPoints;
  const topConstructors = results.value?.get(
    selectedRace.value.id,
  )?.topConstructorsPoints;
  if (!map || !topConstructors) {
    return [];
  }
  return [...map.entries()]
    .map(([constructorId, points]) => {
      const predictedThisConstructor = currentRacePredictions.value
        ?.filter(
          (prediction) =>
            prediction.position === "constructorWithMostPoints" &&
            constructorId === prediction.constructorId,
        )
        // @ts-expect-error Type isn't coming through correctly
        .map((prediction) => prediction.prediction.user);
      return {
        points,
        constructorId,
        users: predictedThisConstructor,
        didAnyonePredict: predictedThisConstructor?.length,
        isCorrect: topConstructors.has(constructorId),
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points || a.constructorId.localeCompare(b.constructorId),
    );
});

const predictionsByUser = computed(() => {
  return currentRacePredictions.value?.reduce((driverMap, el) => {
    const {
      driverId,
      position,
      // @ts-expect-error incorrect type
      prediction: { user },
    } = el;
    if (!driverId) {
      return driverMap;
    }
    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, new Map([[position, [user]]]));
      return driverMap;
    }
    const positionMap = driverMap.get(driverId);
    const existing = positionMap.get(position);
    positionMap.set(position, [...(existing || []), user]);
    return driverMap;
  }, new Map());
});

const constructorColumns = [
  { key: "points", label: "Points" },
  { key: "constructor", label: "Constructor" },
  { key: "users", label: "Predictions" },
];

const gpColumns = [
  { key: "place", label: "Place" },
  { key: "driver", label: "Driver" },
  { key: "predictions", label: "Predictions" },
];
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Results
  .is-page-height.space-y-12
    template(v-if="[resultsStatus, predictionStatus, racesStatus].some(status => ['pending', 'idle'].includes(status))")
      .space-y-12.is-container
        USkeleton.w-full.h-60
        .space-y-4
          template(v-for="i in 6" :key='i')
            USkeleton.w-full.h-12
    template(v-else-if="!results")
      .text-center.py-4.is-container
        h2.is-display-6 No results available
        p.text-muted Please check back later.
    template(v-else)
      .is-container
        UCard
          template(#header)
            h2.is-display-6 Leaderboard
          UTable(:columns="leaderboardColumns" :rows="leaderboard")
            template(#user-data="{ row }")
              .flex.items-center.gap-2
                UAvatar(:alt="row.user.name" size="sm")
                p {{ row.user.name }}
      section.space-y-12
        .is-bg-pattern.py-4
          .flex.items-center.justify-between.is-container
            UButton(type="button" @click="goPrevious" label="Previous" variant="soft" :disabled="selectedIndex === 0")
            TextHero(:level="2" :heading="selectedRace?.raceName")
            UButton(@click="goNext" :disabled="racesWithResults?.length === (selectedIndex + 1)" variant="soft" label="Next")
        .is-container.space-y-12
          div
            h3.is-display-6.inline-flex.items-center.gap-1
              UIcon(:name="Icons.GrandPrix")
              | Grand Prix
            UTable(:rows="gpResults" :columns="gpColumns")
              template(#predictions-data=" { row }")
                .grid.grid-cols-3
                  div
                    template(v-if="row.predictedP1By?.length")
                      p.is-display-7 P1
                      .flex.gap-1
                        template(v-for="item in row.predictedP1By" :key='item.name')
                          UTooltip(:text="item.name")
                            UChip(inset :color="row.isP1Correct ? 'green' : 'gray'" position="bottom-right" size="md")
                              template(#content)
                                UIcon(:name="row.isP1Correct ? 'carbon:checkmark': 'carbon:close'")
                              UAvatar(:alt="item.name")
                  div
                    template(v-if="row.predictedP10By?.length")
                      p.is-display-7 P10
                      .flex.gap-1
                        template(v-for="item in row.predictedP10By" :key='item.name')
                          UTooltip(:text="item.name")
                            UChip(inset :color="row.isP10Correct ? 'green' : 'gray'" position="bottom-right" size="md")
                              template(#content)
                                UIcon(:name="row.isP10Correct ? 'carbon:checkmark': 'carbon:close'")
                              UAvatar(:alt="item.name")
                  div
                    template(v-if="row.predictedLast?.length")
                      p.is-display-7 Last
                      .flex.gap-1
                        template(v-for="item in row.predictedLast" :key='item.name')
                          UTooltip(:text="item.name")
                            UChip(inset :color="row.isLastCorrect ? 'green' : 'gray'" position="bottom-right" size="md")
                              template(#content)
                                UIcon(:name="row.isLastCorrect ? 'carbon:checkmark': 'carbon:close'")
                              UAvatar(:alt="item.name")
              template(#driver-data=" { row }")
                DriverOption(:option="row.driver" short :class="{'opacity-50': !row.didAnyonePredict}")

          div
            h3.is-display-6.inline-flex.items-center.gap-1
              UIcon(:name="Icons.Qualifying")
              | Qualifying
            UTable(:rows="qualifyingResults" :columns="gpColumns")
              template(#predictions-data=" { row }")
                template(v-if="row.predictedP1By?.length")
                  .flex.gap-1
                    template(v-for="item in row.predictedP1By" :key='item.name')
                      UTooltip(:text="item.name")
                        UChip(inset :color="row.isP1Correct ? 'green' : 'gray'" position="bottom-right" size="md")
                          template(#content)
                            UIcon(:name="row.isP1Correct ? 'carbon:checkmark': 'carbon:close'")
                          UAvatar(:alt="item.name")
              template(#driver-data=" { row }")
                DriverOption(:option="row.driver" short)
          .space-y-4
            TextHero(:level="3" heading="Constructors" description="With most points")
            UTable(:rows="constructorResults" :columns="constructorColumns")
              template(#users-data=" { row }")
                template(v-if="row.users?.length")
                  .flex.gap-1
                    template(v-for="item in row.users" :key='item.name')
                      UTooltip(:text="item.name")
                        UChip(inset :color="row.isCorrect ? 'green' : 'gray'" position="bottom-right" size="md")
                          template(#content)
                            UIcon(:name="row.isCorrect ? 'carbon:checkmark': 'carbon:close'")
                          UAvatar(:alt="item.name")
                template(v-else)
                  div
              template(#constructor-data=" { row }")
                template(v-if="['idle', 'pending'].includes(constructorsStatus)")
                  USkeleton.h-8.w-full
                template(v-else-if="constructorsMap?.has(row.constructorId)")
                  ConstructorOption(:option="constructorsMap?.get(row.constructorId)")
                template(v-else)
                  p {{ row.constructorId }}

        .is-bg-pattern.mt-8
          .flex.items-center.justify-between.is-container.py-2
            UButton(type="button" @click="goPrevious" label="Previous" variant="soft" :disabled="selectedIndex === 0")
            p.is-display-7 {{ selectedRace?.raceName}}
            UButton(@click="goNext" :disabled="racesWithResults?.length === (selectedIndex + 1)" variant="soft" label="Next")
</template>
