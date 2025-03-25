<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Contact',
  ogTitle: 'Contact',
})
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Feedback
  .is-bg-pattern
    .is-page-height.is-container
      .is-grid-card-fit.grid.gap-8
        UCard
          template(#header)
            TextHero(:level='2', heading='Bug reports and Feature Requests')
          p.text-muted Found a bug or want to request a feature? The easiest way to leave feedback is to create an issue on GitHub.
          template(#footer)
            UButton(
              :to='HREF_LINKS.GithubIssues',
              label='Create issue',
              target='_blank'
            )

        UCard
          template(#header)
            TextHero(:level='2', heading='Contact')
          p.mt-auto.text-muted Have another question or suggestion? I’d love to hear from you!
          template(#footer)
            UButton(:to='HREF_LINKS.Email', label='Send an email')
</template>
