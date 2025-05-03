<script setup lang="ts">
import { formatDistanceToNowStrict } from 'date-fns'
import type { BadgeProps } from '@nuxt/ui'

const props = withDefaults(
  defineProps<{
    badge?: BadgeProps
    date: Date
  }>(),
  {
    badge: () => ({
      color: 'primary',
      variant: 'subtle',
    }),
  },
)
</script>

<template lang="pug">
UBadge(v-bind='badge')
  span.is-size-8 In {{ formatDistanceToNowStrict(date) }}
</template>
