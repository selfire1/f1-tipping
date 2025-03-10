import { createAuthClient } from "better-auth/vue";

export const useAuth = () => {
  const client = createAuthClient();

  async function signOut() {
    client.signOut();
    await navigateTo({
      path: "/",
      query: {
        ...$getQueryOrigin(QueryOrigin.SignedOut),
      },
    });
    const toast = useToast();
    toast.add({
      title: "Signed out",
      description: "You have been signed out",
    });
  }

  return {
    authClient: client,
    isSignedIn: computed(() => client.useSession().value?.data),
    signOut,
  };
};

export const useAuthUser = async () => {
  const { authClient } = useAuth();

  return {
    user: (await authClient.useSession(useFetch)).data.value?.user,
  };
};
