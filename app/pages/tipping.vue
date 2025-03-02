<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
// const { data: races } = await useFetch("/api/races");
</script>

<template lang="pug">
pre parent
NuxtPage
//- pre {{ races }}
div
  pre races
  pre next race
  pre upcoming races
  pre leaderboard
</template>
