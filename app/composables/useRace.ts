import { useNow } from "@vueuse/core";
import { isBefore } from "date-fns";
import type { Database } from "~~/types/db";

export const useRace = async () => {
  const nuxtApp = useNuxtApp();

  const { data: apiRaces, status } = await useFetch("/api/races", {
    transform(data) {
      return data.items?.map((race) => ({
        ...race,
        grandPrixDate: new Date(race.grandPrixDate),
        qualifyingDate: new Date(race.qualifyingDate),
      }));
    },
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log("races are in cache", !!inCache);
      return inCache;
    },
    lazy: true,
  });

  function getIsRaceAfterCutoff(
    race: Pick<Database.Race, "qualifyingDate">,
    cutoffInMinutes?: MaybeRef<number>,
  ): boolean {
    const now = useNow();
    const lastChanceToEnterTips = $getCutoffDate(
      race.qualifyingDate,
      unref(cutoffInMinutes),
    );
    return isBefore(now.value, lastChanceToEnterTips);
  }

  return {
    allRaces: apiRaces,
    status,
    getIsRaceAfterCutoff,
    getRacesInTheFuture(cutoffInMinutes?: MaybeRef<number>): Database.Race[] {
      const all = apiRaces.value;
      return (
        all
          ?.filter((race) => getIsRaceAfterCutoff(race, cutoffInMinutes))
          ?.map((race) => ({
            ...race,
            created: new Date(race.created),
            lastUpdated: new Date(race.lastUpdated),
          })) ?? []
      );
    },
  };
};
