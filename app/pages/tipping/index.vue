<script setup lang="ts">
import { addDays, differenceInDays, isFuture, isPast } from 'date-fns'
import { $getCachedFetchConfig } from '~/utils'

definePageMeta({
  layout: false,
})

const { allUserGroups, currentUserGroup } = await useGroup()
const { getRacesInTheFuture, deserialise } = useRace()
const { data: allRaces, status: raceStatus } = await useFetch('/api/races', {
  ...$getCachedFetchConfig('races'),
  transform: (data) => data.items.map(deserialise),
  lazy: true,
})
const nextRace = computed(() =>
  !currentUserGroup.value
    ? undefined
    : getRacesInTheFuture(allRaces.value, currentUserGroup.value)?.[0],
)

const championshipCutoffDate = computed(() => {
  const firstRace = allRaces.value?.find((race) => race.round === 1)
  if (!firstRace || !currentUserGroup.value) {
    return
  }
  const { getCutoffDateForPosition } = useCutoff({
    race: firstRace,
    group: currentUserGroup.value,
  })

  return getCutoffDateForPosition('p1')
})

useSeoMeta({
  title: 'Dashboard',
  ogTitle: 'Dashboard',
})

const ongoingRace = computed(() => {
  return allRaces.value?.find((race) => {
    if (!currentUserGroup.value) {
      return
    }
    const { getIsRaceFullyAfterCutoff } = useCutoff({
      race: race,
      group: currentUserGroup.value,
    })
    const isAfterCutoff = getIsRaceFullyAfterCutoff()
    const dayAfterGrandPrix = addDays(new Date(race.grandPrixDate), 1)
    const isBeforeEndOfRace = isFuture(dayAfterGrandPrix)
    return isAfterCutoff && isBeforeEndOfRace
  })
})

const previousRace = computed(() => {
  const nextRound = nextRace.value?.round
  if (!nextRound || nextRound === 1) {
    return
  }
  const previousRace = allRaces.value?.find(
    (race) => race.round === nextRound - 1,
  )
  if (!previousRace) {
    return
  }
  const isAfterRace = isPast(new Date(previousRace.grandPrixDate))
  const isFiveDaysAgo =
    differenceInDays(new Date(), new Date(previousRace.grandPrixDate)) <= 5
  if (!isAfterRace || !isFiveDaysAgo) {
    return
  }
  return previousRace
})
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Dashboard
  .is-page-height.is-container
    template(
      v-if='[raceStatus].some((el) => el === "idle" || el === "pending")'
    )
      .flex.justify-center
        SystemLoader
    template(v-else)
      .is-grid-card-fit.grid.gap-8
        template(v-if='!allUserGroups?.length')
          LazyCardJoinGroup
        template(v-else)
          template(v-if='ongoingRace')
            div
              LazyCardRaceTips(:race='ongoingRace')
          template(v-if='previousRace')
            LazyCardResults(:race='previousRace')
          template(
            v-if='championshipCutoffDate && isFuture(championshipCutoffDate)'
          )
            LazyCardTipChampionships(:cutoff-date='championshipCutoffDate')
          template(v-if='nextRace')
            LazyCardTipRace(:race='nextRace')
            LazyCardTipStatus(:race='nextRace')
</template>
