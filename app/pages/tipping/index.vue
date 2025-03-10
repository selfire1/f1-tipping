<script setup lang="ts">
import { isFuture } from "date-fns";
import BadgeTimeTo from "~/components/BadgeTimeTo.vue";
import { $getCutoffDate } from "~~/shared/utils";

const { user } = await useAuthUser();
if (!user?.id) {
  await navigateTo("/auth");
}

definePageMeta({
  layout: false,
});

const { allUserGroups, currentUserGroup } = await useGroup();
const { getRacesInTheFuture, allRaces } = await useRace();
const nextRace = computed(
  () => getRacesInTheFuture(currentUserGroup.value?.cutoffInMinutes)?.[0],
);

const nextRaceCutOffDate = computed(() =>
  nextRace?.value?.qualifyingDate
    ? $getCutoffDate(
        nextRace.value?.qualifyingDate,
        currentUserGroup.value?.cutoffInMinutes,
      )
    : null,
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
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Dashboard
  .is-page-height.is-container
    .grid.is-grid-card-fit.gap-8
      template(v-if="!allUserGroups?.length")
        UCard
          template(#header)
            TextHero(:level="2" heading="Join or start a group" description="You are not yet a member of a group. Get started tipping by joining or creating a group.")
          UButton(to="/tipping/groups" label="Manage groups")
      template(v-else)
        template(v-if="nextRace")
          UCard
            template(#header)
              h2.is-display-7 Next Race
            template(#footer)
              UButton(label="Tip now" to="/tipping/add-tips" trailing icon="carbon:arrow-right")
            .space-y-4
              .relative.overflow-hidden.py-4.-mx-4.-mt-5(class="sm:-mx-6 sm:-mt-6")
                AppImg.pointer-events-none.opacity-5.h-full.w-full.object-cover.inset-0.absolute(:src="COUNTRY_FLAGS[nextRace.country]")
                .px-6
                  .flex.items-center.justify-between.is-size-8.uppercase.text-muted
                    p {{ "Round " + nextRace.round }}
                    p
                      span {{ nextRace.locality + ", " }}
                      span {{ nextRace.country }}
                  p.is-display-5 {{ nextRace.raceName }}
              .is-size-7(v-if="nextRaceCutOffDate")
                p.is-display-7.flex.items-center.gap-2
                  | Tipping closes
                  BadgeTimeTo(:date="nextRaceCutOffDate")
                .flex
                  .pl-2
                    p {{ nextRaceCutOffDate.toLocaleString(undefined, { hour: "numeric", minute: "2-digit"}) }}
                    p {{ nextRaceCutOffDate.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" }) }}

        template(v-if="championshipCutoffDate && isFuture(championshipCutoffDate)")
          UCard
            template(#header)
              h2.is-display-7 Championships
            template(#footer)
              UButton(label="Tip now" to="/tipping/championships" trailing icon="carbon:arrow-right")
            .space-y-4
              .relative.overflow-hidden.py-4.-mx-4.-mt-5(class="sm:-mx-6 sm:-mt-6")
                AppImg.pointer-events-none.opacity-5.h-full.w-full.object-cover.inset-0.absolute(src="https://images.unsplash.com/photo-1514820720301-4c4790309f46?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")
                .px-6
                  p.is-size-7.text-muted Drivers’ and Constructors’
                  p.is-display-5 Championships
              .is-size-7
                p.is-display-7.flex.items-center.gap-2
                  | Tipping closes
                  BadgeTimeTo(:date="championshipCutoffDate")
                .flex
                  .pl-2
                    p {{ championshipCutoffDate.toLocaleString(undefined, { hour: "numeric", minute: "2-digit"}) }}
                    p {{ championshipCutoffDate.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" }) }}
</template>
