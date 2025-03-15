<script setup lang="ts">
import type { Database } from "~~/types/db";

const props = defineProps<{
  option: Database.Constructor;
}>();
</script>

<template lang="pug">
.flex.items-center.gap-2
  img.size-6(:src="`/img/constructors/${option.id}.avif`")
  span {{ option.name }}
</template>
