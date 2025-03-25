import { FetchError } from 'ofetch'

type BlockMethods = {
  try: () => Promise<void>
}

export const useFetchFunction = (methods: BlockMethods) => {
  const fetchError = ref<FetchError>()
  const isPending = ref(false)
  const { try: tryMethod } = methods

  async function run() {
    fetchError.value = undefined
    isPending.value = true
    try {
      await tryMethod()
    } catch (e) {
      console.error(e)

      if (e instanceof FetchError) {
        fetchError.value = e
      }
    } finally {
      isPending.value = false
    }
  }
  return { isPending, fetchError, run }
}
