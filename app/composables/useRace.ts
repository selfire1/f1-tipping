import { useNow } from "@vueuse/core";
import { isBefore } from "date-fns";

export const useRace = async () => {
  const nuxtApp = useNuxtApp();

  const { data: apiRaces } = await useFetch("/api/races", {
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
    getRacesInTheFuture(cutoffInMinutes: MaybeRef<number> = 180) {
      const now = useNow();
      const all = apiRaces.value;
      return all?.filter((race) => {
        const lastChanceToEnterTips = getCutoffDate(
          race.qualifyingDate,
          unref(cutoffInMinutes),
        );
        return isBefore(now.value, lastChanceToEnterTips);
      });
    },
  };
};
