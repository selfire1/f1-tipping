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
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Tipping status
  div
    template(v-if='status === "idle" || status === "pending"')
      USkeleton.h-16.w-full
    template(v-else)
      .is-display-7.flex.flex-wrap.gap-6
        template(v-if='tippedStatus?.notTipped?.length')
          .space-y-2
            .flex.items-center.gap-1
              UIcon(name='carbon:hourglass')
              p Yet to tip
            UAvatarGroup(:max='8')
              template(v-for='user in tippedStatus.notTipped', :key='user.id')
                UserAvatar(:user='user')
        template(v-if='tippedStatus?.tipped?.length')
          .space-y-2
            .flex.items-center.gap-1
              UIcon(:name='Icons.HasTipped')
              p Already tipped
            UAvatarGroup(:max='8')
              template(v-for='user in tippedStatus.tipped', :key='user.id')
                UserAvatar(:user='user')
</template>
