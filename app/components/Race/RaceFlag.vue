<script setup lang="ts">
import type { Database } from "~~/types/db";

const props = defineProps<{
  country?: Database.Race["country"];
}>();
</script>

<template lang="pug">
template(v-if="country && COUNTRY_FLAGS[country]")
  .aspect-landscape.size-24.relative
    .absolute.inset-0.flex.items-center.justify-center
      NuxtImg.border.bg-faint.rounded(:src="COUNTRY_FLAGS[country]")

</template>
