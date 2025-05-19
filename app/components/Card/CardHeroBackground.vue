<script setup lang="ts">
defineProps<{
  src?: string
}>()
</script>

<template lang="pug">
.relative.-mx-4.-mt-4.overflow-hidden.py-4(class='sm:-mx-6 sm:-mt-6')
  AppImg.pointer-events-none.absolute.inset-0.h-full.w-full.object-cover.opacity-5(
    v-if='src',
    :src,
    lazy,
    alt=''
  )
  slot
</template>
