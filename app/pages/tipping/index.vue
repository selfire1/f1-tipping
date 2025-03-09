<script setup lang="ts">
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
const { getRacesInTheFuture } = await useRace();
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
              .relative.overflow-hidden.py-4.-mx-6.-mt-6
                NuxtImg.opacity-5.h-full.w-full.object-cover.inset-0.absolute(:src="COUNTRY_FLAGS[nextRace.country]")
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
</template>
