<script setup lang="ts">
import { isFuture, isThisWeek } from "date-fns";
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
const {
  getRacesInTheFuture,
  allRaces,
  status: raceStatus,
  getIsRaceAfterCutoff,
} = await useRace();
const nextRace = computed(
  () => getRacesInTheFuture(currentUserGroup.value?.cutoffInMinutes)?.[0],
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

const { data: predictions } = useFetch(
  `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    ...$getCachedFetchConfig("predictions"),
  },
);

const raceThisWeek = computed(() => {
  return allRaces.value?.find((race) =>
    isThisWeek(new Date(race.qualifyingDate)),
  );
});
const isRaceThisWeekAfterTippingCutoff = computed(() => {
  if (!raceThisWeek.value) {
    return false;
  }
  return getIsRaceAfterCutoff(
    raceThisWeek.value,
    currentUserGroup.value?.cutoffInMinutes,
  );
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
          template(v-if="isRaceThisWeekAfterTippingCutoff && raceThisWeek")
            div
              CardRaceTips(:race="raceThisWeek")
          template(v-if="championshipCutoffDate && isFuture(championshipCutoffDate)")
            LazyCardTipChampionships(:cutoff-date="championshipCutoffDate")
          template(v-if="nextRace")
            LazyCardTipRace(:race='nextRace')

</template>
