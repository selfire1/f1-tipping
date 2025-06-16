<script setup lang="ts">
import RulesMarkdownServer from '~/components/RulesMarkdown.server.vue'

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Rules',
  ogTitle: 'Rules',
})
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Rules and Scoring
  .is-page-height.is-container
    RulesMarkdownServer.prose.pb-12
</template>
