<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template lang="pug">
header
  AppHeader
.is-bg-pattern.min-h-screen.py-4
  .is-container.flex
    UCard.mx-auto.w-full.max-w-prose.text-center
      TextHero(
        :level='1',
        heading='Error',
        :description='error?.message ?? "Something went wrong."'
      )
      DevOnly
        SystemError(heading='', description='')
          | {{ error }}
      template(#footer)
        UButton(@click='handleError', label='Go to homepage')
</template>
