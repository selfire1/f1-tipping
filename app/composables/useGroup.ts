export const useGroup = async () => {
  const nuxtApp = useNuxtApp();

  const {
    data: userGroups,
    status,
    refresh,
    error,
  } = await useFetch("/api/user/get-groups", {
    transform: (data) => data.items,
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log("groups are in cache", !!inCache);
      return inCache;
    },
  });

  const currentUserGroup = ref(userGroups.value?.[0]?.group);
  watch(userGroups, () => {
    currentUserGroup.value = userGroups.value?.[0]?.group;
  });

  return {
    allUserGroups: userGroups,
    currentUserGroup,
    status,
    refresh,
    error,
  };
};
