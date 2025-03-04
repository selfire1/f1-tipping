<script setup lang="ts">
import TextHero from "~/components/TextHero.vue";

const { authClient } = useAuth();
const toast = useToast();
async function signInWithGoogle() {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/tipping",
  });
  if (data.error) {
    toast.add({
      title: "Something went wrong",
      description:
        "Please try signing in with Google again. If this error persists, please contact us.",
    });
    return;
  }
  await navigateTo("/tipping");
}

const { query } = useRoute();
const router = useRouter();
onMounted(() => {
  if (query.origin === QueryOrigin.NotAllowed) {
    const toast = useToast();
    toast.add({
      title: "Please sign in",
      description: "You must be signed in to access this page",
    });
    router.replace({
      query: {
        ...(query ?? {}),
        ...$getQueryOrigin(null),
      },
    });
  }
});
</script>

<template lang="pug">
.is-bg-pattern
  .is-container.flex
    UCard.mx-auto.max-w-prose.text-center
      .space-y-8
        TextHero(heading="Get started" description="Whether you already have started tipping with GridTipp, or are creating a new account, sign in with Google to get started." :level="1")
        div
          UButton(@click="signInWithGoogle" size="lg")
            img.w-6.h-6(src='https://www.svgrepo.com/show/475656/google-color.svg', loading='lazy', alt='google logo')
            span Continue with Google

</template>
