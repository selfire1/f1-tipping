<script setup lang="ts">
import TextHero from '~/components/TextHero.vue'

const { signIn } = useAuth()
const toast = useToast()
const { query } = useRoute()
async function signInWithGoogle() {
  const data = await signIn.social({
    provider: 'google',
    callbackURL: (query?.redirect as string | undefined) || '/tipping',
  })
  if (data.error) {
    toast.add({
      title: 'Something went wrong',
      description:
        'Please try signing in with Google again. If this error persists, please contact us.',
    })
    return
  }
  await navigateTo('/tipping')
}

const router = useRouter()
onMounted(() => {
  if (query.origin === QueryOrigin.NotAllowed) {
    const toast = useToast()
    toast.add({
      title: 'Please sign in',
      description: 'You must be signed in to access this page',
    })
    router.replace({
      query: {
        ...(query ?? {}),
        ...$getQueryOrigin(null),
      },
    })
  }
})

const description = (() => {
  switch (query.origin) {
    case QueryOrigin.Join:
      return 'Please sign in or create an account first before joining this group.'
    default:
      return 'Whether you already have started tipping with GridTipp, or are creating a new account, sign in with Google to get started.'
  }
})()

useSeoMeta({
  title: 'Log in or Sign up',
  ogTitle: 'Log in or Sign up',
})
</script>

<template lang="pug">
.is-bg-pattern.is-page-height
  .is-container.flex
    UCard.mx-auto.max-w-prose.text-center
      .space-y-8
        TextHero(heading='Get started', :description, :level='1')
        div
          UButton(@click='signInWithGoogle', size='lg')
            img.h-6.w-6(
              src='https://www.svgrepo.com/show/475656/google-color.svg',
              loading='lazy',
              alt='google logo'
            )
            span Continue with Google
</template>
