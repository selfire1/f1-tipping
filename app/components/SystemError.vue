<script setup lang="ts">
import type { FetchError } from "ofetch";
withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    fetchError?: FetchError;
  }>(),
  {
    description: "Contact us if this issue persist.",
  },
);
</script>

<template lang="pug">
.py-2(class="dark:text-red-200")
  .space-y-1
    p.is-size-6.text-red-600 {{ heading ?? fetchError?.data?.message ?? "Something went wrong"  }}
    p.text-muted.is-size-7 {{ description }}
  DevOnly
    pre.mt-4.overflow-y-auto.is-size-8.p-1.bg-faint
      slot
        | {{ fetchError}}
</template>
