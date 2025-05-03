export const useConstructor = async () => {
  const nuxtApp = useNuxtApp()

  const { data: apiConstructors } = await useFetch('/api/constructors', {
    transform: (data) =>
      data.items.map((item) => ({
        ...item,
        created: new Date(item.created),
        lastUpdated: new Date(item.created),
      })),
    getCachedData: (key) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      console.log('constructors are in cache', !!inCache)
      return inCache
    },
    lazy: true,
  })

  return { allConstructors: apiConstructors }
}
