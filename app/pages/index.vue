<script setup lang="ts"></script>

<template lang="pug">
.is-container
  .py-8.text-center.space-y-6.max-w-prose.mx-auto
    div
      h1.sr-only.text-primary GridTipp
      p.is-display-2 Tip the season
    .text-pretty.space-y-2
      p Gather your friends and establish once and for all who’s the pole predictor of your crew. Lodge your estimates for the whole season, get points after each GP and predict your way to the podium*!
      p.italic.is-size-8.text-muted * Champagne shower not included
    div
      UButton(to="/auth/signup" title="Sign up" icon="carbon:arrow-right" trailing) Get started
</template>
