<script setup lang="ts">
import type { Component } from "~~/types";

defineProps<{
  option: Component.DriverOption;
  short?: boolean;
}>();
</script>

<template lang="pug">
.flex.items-center.gap-2.border-l-4.pl-2(:style="{ 'border-color': option.constructorId ? $getConstructorCssVariable(option.constructorId) : '' }")
  p
    span.text-muted(v-if="!short") {{ option.givenName + " " }}
    span {{ option.familyName }}
</template>
