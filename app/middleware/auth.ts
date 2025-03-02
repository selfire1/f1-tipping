export default defineNuxtRouteMiddleware(async (to, from) => {
  const { authClient } = useAuth();
  const { data: session } = await authClient.useSession(useFetch);
  if (!session.value) {
    return navigateTo({
      path: "/auth",
      query: {
        ...$getQueryOrigin(QueryOrigin.NotAllowed),
      },
    });
  }
});
