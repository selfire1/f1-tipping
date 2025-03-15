<script setup lang="ts">
import { isFuture, isToday } from "date-fns";
import CardRaceTips from "~/components/Card/CardRaceTips.vue";
import { $getCachedFetchConfig } from "~/utils";
import { $getCutoffDate } from "~~/shared/utils";

definePageMeta({
  layout: false,
});

const {
  allUserGroups,
  currentUserGroup,
  status: groupStatus,
} = await useGroup();
const { getRacesInTheFuture, deserialise, getIsRaceAfterCutoff } = useRace();
const { data: allRaces, status: raceStatus } = useFetch("/api/races", {
  ...$getCachedFetchConfig("races"),
  transform: (data) => data.items.map(deserialise),
});
const nextRace = computed(
  () =>
    getRacesInTheFuture(
      allRaces.value,
      currentUserGroup.value?.cutoffInMinutes,
    )?.[0],
);

const championshipCutoffDate = computed(() => {
  const groupCutoff = currentUserGroup.value?.cutoffInMinutes;
  const firstRace = allRaces.value?.find((race) => race.round === 1);
  if (!firstRace) {
    return;
  }
  return $getCutoffDate(firstRace?.qualifyingDate, groupCutoff);
});

useSeoMeta({
  title: "Dashboard",
  ogTitle: "Dashboard",
});

const ongoingRace = computed(() => {
  return allRaces.value?.find((race) => {
    const isAfterCutoff = getIsRaceAfterCutoff(
      race,
      currentUserGroup.value?.cutoffInMinutes,
    );
    const isOnGpDay = isToday(new Date(race.grandPrixDate));
    return isAfterCutoff && isOnGpDay;
  });
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Dashboard
  .is-page-height.is-container
    template(v-if="[groupStatus, raceStatus].some(el => el === 'idle' || el === 'pending')")
      .flex.justify-center
        SystemLoader
    template(v-else)
      .grid.is-grid-card-fit.gap-8
        template(v-if="!allUserGroups?.length")
          LazyCardJoinGroup
        template(v-else)
          template(v-if="ongoingRace")
            div
              LazyCardRaceTips(:race="ongoingRace")
          template(v-if="championshipCutoffDate && isFuture(championshipCutoffDate)")
            LazyCardTipChampionships(:cutoff-date="championshipCutoffDate")
          template(v-if="nextRace")
            LazyCardTipRace(:race='nextRace')

</template>
