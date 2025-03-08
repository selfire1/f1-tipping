import type { Database } from "~~/types/db";
import { useSessionStorage } from "@vueuse/core";

export const useGroup = async () => {
  const nuxtApp = useNuxtApp();

  const {
    data: userGroups,
    status,
    refresh,
    error,
  } = await useFetch("/api/user/get-groups", {
    transform: (data) =>
      data.items.map((el) => ({
        ...el.group,
        createdAt: new Date(el.group.createdAt),
      })),
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log("groups are in cache", !!inCache);
      return inCache;
    },
  });

  const currentUserGroup = useSessionStorage<Database.Group | undefined>(
    "current-group",
    () => userGroups.value?.[0],
  );
  watch(userGroups, () => {
    currentUserGroup.value = userGroups.value?.[0];
  });

  return {
    allUserGroups: userGroups,
    currentUserGroup,
    status,
    refresh,
    error,
  };
};
