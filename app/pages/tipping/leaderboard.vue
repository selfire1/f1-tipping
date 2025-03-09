<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Leaderboard
  .is-bg-pattern
    .is-page-height.is-container
      .flex.items-center.justify-center
        UCard
          .mx-auto.size-8.flex.items-center.justify-center.rounded-full(class="bg-faint/25")
            UIcon.text-muted.size-5(name="carbon:construction")
          span.is-display-6 Coming soon
</template>
