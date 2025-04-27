<script setup lang="ts">
const leaderboardColumns = [
  {
    key: 'place',
    label: 'Place',
  },
  {
    key: 'user',
    label: 'Name',
  },
  {
    key: 'points',
    label: 'Points',
  },
  {
    key: 'change',
    label: 'Delta',
  },
]
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
  UTable(:columns='leaderboardColumns', :rows='leaderboard')
    template(#place-data='{ row }')
      template(v-if='getPlace(row.points) === 1')
        UBadge
          | {{ '🥇 ' + getPlace(row.points) }}
          | .
      template(v-else-if='getPlace(row.points) === 2')
        UBadge(variant='outline')
          | {{ '🥈 ' + getPlace(row.points) }}
          | .
      template(v-else-if='getPlace(row.points) === 3')
        UBadge(variant='subtle')
          | {{ '🥉 ' + getPlace(row.points) }}
          | .
      template(v-else)
        UBadge(variant='soft', :ui='{ variant: { soft: "bg-transparent" } }') {{ getPlace(row.points) + '.' }}

    template(#change-data='{ row: { delta } }')
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
    template(#user-data='{ row: { user } }')
      .flex.items-center.gap-2
        UserAvatar(:user)
        p {{ user.name }}
    template(#points-data='{ row: { points, pointsDelta } }')
      .flex.items-center.gap-2
        UBadge(
          variant='soft',
          :ui='{ variant: { soft: "bg-transparent" } }',
          :label='points'
        )
        template(v-if='pointsDelta !== null')
          template(v-if='pointsDelta > 0')
            UBadge(color='green', variant='soft') +{{ pointsDelta }}
          template(v-else)
            UBadge(
              color='orange',
              variant='soft',
              :ui='{ variant: { soft: "bg-transparent" } }'
            ) {{ pointsDelta }}
</template>
