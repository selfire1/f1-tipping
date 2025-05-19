<script setup lang="ts">
import type { Database } from '~~/types/db'

const props = defineProps<{
  race: Database.Race
}>()

const {
  data: results,
  status,
  error,
} = await useFetch('/api/results', {
  query: {
    raceId: props.race.id,
  },
  lazy: true,
  ...$getCachedFetchConfig('results'),
})
</script>

<template lang="pug">
div
  template(v-if='["idle", "pending"].includes(status)')
    USkeleton.h-full.w-full
  template(v-else-if='status === "error"')
    DevOnly
      pre {{ error }}
  template(v-else)
    UCard
      template(#header)
        h2.is-display-7 Prediction Results
      template(#footer, v-if='results?.items?.length')
        UButton(
          label='View results',
          to='/tipping/leaderboard',
          trailing,
          icon='carbon:arrow-right'
        )

      .space-y-4
        CardHeroBackground(:src='COUNTRY_FLAGS[race.country]')
          .px-6
            .is-size-8.text-muted.flex.items-center.justify-between.uppercase
              p {{ 'Round ' + race.round }}
            p.is-display-5 {{ race.raceName }}
        template(v-if='!results?.items?.length')
          p Results will be available soon.
          p.is-size-7.text-muted Usually results are available the Monday after the race weekend. If it has been some time, feel free to {{ ' ' }}
            UButton.p-0(variant='link', to='/tipping/contact') contact us
            span .
        template(v-else)
          p Results are available. See how you did!
</template>
