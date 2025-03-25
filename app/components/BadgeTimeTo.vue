<script setup lang="ts">
import { formatDistanceToNowStrict } from 'date-fns'
import type { Badge } from '#ui/types'

const props = withDefaults(
  defineProps<{
    badge?: Badge
    date: Date
  }>(),
  {
    badge: () => ({ color: 'gray' }),
  },
)
</script>

<template lang="pug">
UBadge(v-bind='badge')
  span.is-size-8 In {{ formatDistanceToNowStrict(date) }}
</template>
