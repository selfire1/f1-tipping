export default defineNuxtRouteMiddleware(async (to) => {
  const routes = {
    userOnly: [/^\/tipping.*/i],
    guestOnly: [/^\/$/],
  }
  const isNavigatingToUserOnlyRoute = routes.userOnly.some((reg) =>
    to.path.match(reg),
  )
  const isNavigatingToGuestOnlyRoute = routes.guestOnly.some((reg) =>
    to.path.match(reg),
  )

  if (!isNavigatingToUserOnlyRoute && !isNavigatingToGuestOnlyRoute) {
    // skip middleware on un-authed routes
    return
  }

  const { isSignedIn, fetchSession } = useAuth()
  if (isNavigatingToGuestOnlyRoute && isSignedIn.value) {
    return navigateTo('/tipping')
  }

  if (import.meta.client) {
    await fetchSession()
  }

  if (!isSignedIn.value && isNavigatingToUserOnlyRoute) {
    return navigateTo({
      path: '/auth',
      query: {
        ...$getQueryOrigin(QueryOrigin.NotAllowed),
      },
    })
  }
})
