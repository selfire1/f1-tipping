<script setup lang="ts">
import { whenever } from "@vueuse/core";
const { authClient } = useAuth();
const { data, isPending } = await authClient.useSession(useFetch);
const isSignedIn = computed(() => data.value?.user);
useHead({
  titleTemplate: "",
});

onMounted(async () => {
  if (!isSignedIn.value) {
    return;
  }
  await navigateTo("/tipping");
});

whenever(isSignedIn, async () => {
  await navigateTo("/tipping");
});
</script>

<template lang="pug">
.is-container.is-page-height
  .py-8.text-center.space-y-6.max-w-prose.mx-auto
    div
      h1.sr-only.text-primary GridTip
      p.is-display-2 Tip the season
    .text-pretty.space-y-2
      p Gather your friends and establish once and for all who’s the pole predictor of your crew. Lodge your estimates for the whole season, get points after each GP and predict your way to the podium*!
      p.italic.is-size-8.text-muted * Champagne shower not included
    .flex.gap-4.items-center.justify-center
      template(v-if="isPending")
        USkeleton.h-12.w-48
      template(v-else)
        template(v-if="isSignedIn")
          UButton(to="/tipping" size="md" trailing icon="carbon:arrow-right") Open Dashboard
        template(v-if="!isSignedIn")
          UButton(to="/auth" size="md" trailing icon="carbon:arrow-right") Get started
</template>
