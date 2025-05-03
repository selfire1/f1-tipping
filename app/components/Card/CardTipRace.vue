<script setup lang="ts">
import { isFuture } from 'date-fns'
import type { Database } from '~~/types/db'

const props = defineProps<{
  race: Database.Race
}>()

const { currentUserGroup } = await useGroup()

const cutoffDates = computed(() => {
  if (!currentUserGroup.value) {
    return
  }
  const { getCutoffDateForPosition } = useCutoff({
    race: props.race,
    group: currentUserGroup.value,
  })
  return {
    sprint: getCutoffDateForPosition('sprintP1'),
    gp: getCutoffDateForPosition('p1'),
  }
})

const { user } = useAuth()

const { data: tippedStatus, status } = await useFetch(
  () => `/api/prediction/${currentUserGroup.value?.id}/getTipStatus`,
  {
    params: {
      raceId: props.race.id,
    },
    transform(data) {
      const hasCurrentTipped = data.usersByStatus.tipped.some(
        ({ id }) => id === user.value?.id,
      )
      return {
        hasCurrentTipped,
        ...data.usersByStatus,
      }
    },
    lazy: true,
    ...$getCachedFetchConfig('tippedStatus'),
  },
)
// TODO: add skeleton when loading
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Predict the next race
  template(#footer)
    template(v-if='status === "idle" || status === "pending"')
      USkeleton.h-8.w-40
    template(v-else)
      UButton(
        :label='tippedStatus?.hasCurrentTipped ? "Review tips" : "Tip now"',
        to='/tipping/add-tips',
        trailing,
        icon='carbon:arrow-right'
      )
  .space-y-4
    .relative.-mx-4.-mt-5.overflow-hidden.py-4(class='sm:-mx-6 sm:-mt-6')
      AppImg.pointer-events-none.absolute.inset-0.h-full.w-full.object-cover.opacity-5(
        :src='COUNTRY_FLAGS[race.country]',
        lazy
      )
      .px-6
        .is-size-8.flex.items-center.justify-between.uppercase
          p {{ 'Round ' + race.round }}
          p
            span {{ race.locality + ', ' }}
            span {{ race.country }}
        p.is-display-5 {{ race.raceName }}
    div
      template(v-if='cutoffDates?.sprint')
        div
          .is-size-7.space-y-2
            p.is-display-7.flex.items-center.gap-2
              UIcon(:name='Icons.Sprint')
              | Sprint
            div
              p.is-size-7.flex.items-center.gap-2.font-medium
                template(v-if='isFuture(cutoffDates.sprint)')
                  | Tipping closes
                  BadgeTimeTo(:date='cutoffDates.sprint')
                template(v-else)
                  | Closed
              template(v-if='isFuture(cutoffDates.sprint)')
                .flex
                  .pl-2
                    p {{ cutoffDates.sprint.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }) }}
                    p {{ cutoffDates.sprint.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) }}
        USeparator.py-4
      template(v-if='cutoffDates && cutoffDates.gp')
        div
          .is-size-7.space-y-2
            p.is-display-7.flex.items-center.gap-2
              UIcon(:name='Icons.GrandPrix')
              | Grand Prix
            div
              p.is-size-7.flex.items-center.gap-2.font-medium
                template(v-if='isFuture(cutoffDates.gp)')
                  | Tipping closes
                  BadgeTimeTo(:date='cutoffDates.gp')
              .flex
                .pl-2
                  p {{ cutoffDates.gp.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }) }}
                  p {{ cutoffDates.gp.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) }}
</template>
