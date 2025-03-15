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

  return {
    allRaces: apiRaces,
    status,
    getRacesInTheFuture(cutoffInMinutes?: MaybeRef<number>): Database.Race[] {
      const now = useNow();
      const all = apiRaces.value;
      return (
        all
          ?.filter((race) => {
            const lastChanceToEnterTips = $getCutoffDate(
              race.qualifyingDate,
              unref(cutoffInMinutes),
            );
            return isBefore(now.value, lastChanceToEnterTips);
          })
          ?.map((race) => ({
            ...race,
            created: new Date(race.created),
            lastUpdated: new Date(race.lastUpdated),
          })) ?? []
      );
    },
  };
};
