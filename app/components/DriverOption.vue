<script setup lang="ts">
import type { Driver } from "~~/types";
defineProps<{
  option: Driver;
}>();
</script>

<template lang="pug">
.flex.items-center.gap-2.border-l-4.pl-2(:style="{ 'border-color': option.constructor.id ? $getConstructorCssVariable(option.constructor.id) : '' }")
  p
    span.text-muted {{ option.givenName + " " }}
    span.is-size-7 {{ option.familyName }}
</template>
