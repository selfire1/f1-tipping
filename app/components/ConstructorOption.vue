<script setup lang="ts">
import type { Component } from '~~/types'

defineProps<{
  option?: Component.ConstructorOption
}>()
</script>

<template lang="pug">
.flex.items-center.gap-2(v-if='option')
  img.size-6(:src='`/img/constructors/${option.id}.avif`')
  span {{ option.name }}
</template>
