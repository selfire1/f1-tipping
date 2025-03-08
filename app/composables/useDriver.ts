export const useDriver = async () => {
  const nuxtApp = useNuxtApp();

  const { data: apiDrivers } = await useFetch("/api/drivers", {
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log("drivers are in cache", !!inCache);
      return inCache;
    },
    lazy: true,
  });

  return { allDrivers: apiDrivers };
};
