import { authClient as client } from "~~/lib/auth-client";

export const useAuth = () => {
  return {
    authClient: client,
    isSignedIn: computed(() => client.useSession().value?.data),
  };
};
