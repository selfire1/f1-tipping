<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template lang="pug">
header
  AppHeader
.min-h-screen.is-bg-pattern.py-4
  .is-container.flex
    UCard.mx-auto.max-w-prose.text-center.w-full
      TextHero(:level="1" heading="Error" :description="error?.message ?? 'Something went wrong.'")
      DevOnly
        SystemError(heading="" description="")
          | {{ error }}
      template(#footer)
        UButton(@click="handleError" label="Go to homepage")
</template>
