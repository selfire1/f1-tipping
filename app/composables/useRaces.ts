export const useRaces = async () => {
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

  return { allRaces: apiRaces };
};
