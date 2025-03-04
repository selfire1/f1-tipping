import { createAuthClient } from "better-auth/vue";

export const useAuth = () => {
  const client = createAuthClient();
  return {
    authClient: client,
    isSignedIn: computed(() => client.useSession().value?.data),
  };
};

export const useAuthUser = async () => {
  const { authClient } = useAuth();

  return {
    user: (await authClient.useSession(useFetch)).data.value?.user,
  };
};
