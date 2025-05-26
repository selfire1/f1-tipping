<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
const leaderboardColumns = [
  {
    id: 'place',
    header: 'Place',
  },
  {
    id: 'user',
    header: 'Name',
  },
  {
    id: 'points',
    header: 'Points',
  },
  {
    id: 'change',
    header: 'Delta',
  },
] satisfies TableColumn<typeof leaderboard>[]
const { leaderboard, getPositionArray } = await useResults()
const topPoints = computed(() => {
  return getPositionArray(leaderboard.value)
})

function getPlace(points: number) {
  return topPoints.value.indexOf(points) + 1
}
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-6 Leaderboard
  UTable(:columns='leaderboardColumns', :data='leaderboard')
    template(#place-cell='{ row: { original: { points } } }')
      template(v-if='getPlace(points) === 1')
        UBadge
          | {{ '🥇 ' + getPlace(points) }}
          | .
      template(v-else-if='getPlace(points) === 2')
        UBadge(variant='outline')
          | {{ '🥈 ' + getPlace(points) }}
          | .
      template(v-else-if='getPlace(points) === 3')
        UBadge(variant='subtle')
          | {{ '🥉 ' + getPlace(points) }}
          | .
      template(v-else)
        UBadge.bg-transparent(variant='soft') {{ getPlace(points) + '.' }}

    template(#change-cell='{ row: { original: { delta } } }')
      template(v-if='delta !== null')
        template(v-if='delta === 0')
          UIcon.bg-gray-500(name='carbon:subtract')
        template(v-else-if='delta > 0')
          .flex.items-center.gap-1.text-green-500
            UIcon.is-display-7(name='carbon:arrow-up')
            p.is-display-8 {{ delta }}
        template(v-else-if='delta < 0')
          .flex.items-center.gap-1.text-red-500
            UIcon.is-display-7(name='carbon:arrow-down')
            p.is-display-8 {{ delta }}
    template(#user-cell='{ row: { original: { user } } }')
      .flex.items-center.gap-2
        UserAvatar(:user)
        p {{ user.name }}
    template(#points-cell='{ row: { original: { points, pointsDelta } } }')
      .flex.items-center.gap-2
        UBadge(variant='soft', :label='points')
        template(v-if='pointsDelta !== null')
          template(v-if='pointsDelta > 0')
            UBadge.bg-transparent(color='success', variant='soft') +{{ pointsDelta }}
          template(v-else)
            UBadge.bg-transparent(color='neutral', variant='soft') {{ pointsDelta }}
</template>
