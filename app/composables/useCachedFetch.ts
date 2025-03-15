import type { UseFetchOptions } from "nuxt/app";

export const useCachedFetch = <T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) => {
  const nuxtApp = useNuxtApp();
  return useFetch(url, {
    ...options,
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log(url, "is in cache:", !!inCache);
      return inCache;
    },
  });
};
