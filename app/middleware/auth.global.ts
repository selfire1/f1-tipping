export default defineNuxtRouteMiddleware(async (to) => {
  const isUserNavigatingToTheApp = to.path.startsWith('/tipping')
  if (!isUserNavigatingToTheApp) {
    return
  }

  const { authClient } = useAuth()
  const { data: loggedIn } = await authClient.useSession(useFetch)
  if (!loggedIn.value) {
    return navigateTo({
      path: '/auth',
      query: {
        ...$getQueryOrigin(QueryOrigin.NotAllowed),
      },
    })
  }
})
