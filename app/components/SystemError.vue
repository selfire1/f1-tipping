<script setup lang="ts">
import type { FetchError } from 'ofetch'
withDefaults(
  defineProps<{
    heading?: string
    description?: string
    fetchError?: FetchError
  }>(),
  {
    description: 'Contact us if this issue persist.',
  },
)
</script>

<template lang="pug">
.py-2(class='dark:text-red-200')
  .space-y-1
    p.is-size-6.text-red-600 {{ heading ?? fetchError?.data?.message ?? 'Something went wrong' }}
    p.is-size-7.text-muted {{ description }}
    p.is-size-7.text-muted
      span If this issue persists, please
      NuxtLink.text-primary(to='/tipping/contact', class='hover:underline') contact us
      span .
  DevOnly
    pre.is-size-8.mt-4.overflow-y-auto.bg-faint.p-1
      slot
        | {{ fetchError }}
</template>
