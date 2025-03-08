export const useConstructor = async () => {
  const nuxtApp = useNuxtApp();

  const { data: apiConstructors } = await useFetch("/api/constructors", {
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log("constructors are in cache", !!inCache);
      return inCache;
    },
    lazy: true,
  });

  return { allConstructors: apiConstructors };
};
