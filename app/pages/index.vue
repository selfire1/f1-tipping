<script setup lang="ts">
useHead({
  titleTemplate: '',
})

const { isSignedIn } = useAuth()
</script>

<template lang="pug">
.is-container.is-page-height
  .mx-auto.max-w-prose.space-y-6.py-8.text-center
    div
      h1.text-primary.sr-only GridTip
      p.is-display-2 Tip the season
    .space-y-2.text-pretty
      p Gather your friends and establish once and for all who’s the pole predictor of your crew. Lodge your estimates for the whole season, get points after each GP and predict your way to the podium*!
      p.is-size-8.italic.text-muted * Champagne shower not included
    .flex.items-center.justify-center.gap-4
      template(v-if='isSignedIn')
        UButton(to='/tipping', size='md', trailing, icon='carbon:arrow-right') Open Dashboard
      template(v-if='!isSignedIn')
        UButton(to='/auth', size='md', trailing, icon='carbon:arrow-right') Get started
</template>
