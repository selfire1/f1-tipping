export default defineNuxtPlugin(async (nuxtApp) => {
  if (!nuxtApp.payload.serverRendered) {
    await useAuth().fetchSession()
    return
  }
  if (nuxtApp.payload.prerenderedAt || nuxtApp.payload.isCached) {
    nuxtApp.hook('app:mounted', async () => {
      await useAuth().fetchSession()
    })
  }
})
