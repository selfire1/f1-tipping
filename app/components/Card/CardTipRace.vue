<script setup lang="ts">
import { UAvatarGroup, UDivider } from '#components'
import type { Database } from '~~/types/db'
import UserAvatar from '../UserAvatar.vue'

const props = defineProps<{
  race: Database.Race
}>()

const { currentUserGroup } = await useGroup()

const nextRaceCutOffDate = computed(() =>
  props?.race?.qualifyingDate
    ? $getCutoffDate(
        props.race.qualifyingDate,
        currentUserGroup.value?.cutoffInMinutes,
      )
    : null,
)

const { user } = useAuth()

const { data: tippedStatus } = await useFetch(
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
        .is-size-8.flex.items-center.justify-between.uppercase.text-muted
          p {{ 'Round ' + race.round }}
          p
            span {{ race.locality + ', ' }}
            span {{ race.country }}
        p.is-display-5 {{ race.raceName }}
    .is-size-7(v-if='nextRaceCutOffDate')
      p.is-display-7.flex.items-center.gap-2
        | Tipping closes
        BadgeTimeTo(:date='nextRaceCutOffDate')
      .flex
        .pl-2
          p {{ nextRaceCutOffDate.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) }}
          p {{ nextRaceCutOffDate.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }) }}
    UDivider
    .is-size-7.flex.flex-wrap.gap-6
      template(v-if='tippedStatus?.tipped?.length')
        .space-y-2
          p Already tipped
          UAvatarGroup(:max='6')
            template(v-for='user in tippedStatus.tipped', :key='user.id')
              UserAvatar(:user='user')
      template(v-if='tippedStatus?.notTipped?.length')
        .space-y-2
          p Yet to tip
          UAvatarGroup(:max='6')
            template(v-for='user in tippedStatus.notTipped', :key='user.id')
              UserAvatar(:user='user')
</template>
