import { createAuthClient } from 'better-auth/vue'
import type {
  InferSessionFromClient,
  InferUserFromClient,
  ClientOptions,
} from 'better-auth/client'

export const useAuth = () => {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
  })

  const session = useState<InferSessionFromClient<ClientOptions> | null>(
    'auth:session',
    () => null,
  )
  const user = useState<InferUserFromClient<ClientOptions> | null>(
    'auth:user',
    () => null,
  )
  const sessionFetching = import.meta.server
    ? ref(false)
    : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true
    const { data } = await client.getSession({
      fetchOptions: {
        headers,
      },
    })
    session.value = data?.session || null
    user.value = data?.user || null
    sessionFetching.value = false
    return data
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    isSignedIn: computed(() => !!session.value),
    signIn: client.signIn,
    async signOut() {
      await client.signOut()
      session.value = null
      user.value = null
      await navigateTo({
        path: '/',
        query: {
          ...$getQueryOrigin(QueryOrigin.SignedOut),
        },
      })
      const toast = useToast()
      toast.add({
        title: 'Signed out',
        description: 'You have been signed out',
      })
    },
    fetchSession,
    authClient: client,
  }
}

export const useAuthUser = async () => {
  const { authClient } = useAuth()

  return {
    user: (await authClient.useSession(useFetch)).data.value?.user,
  }
}
