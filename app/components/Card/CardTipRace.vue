<script setup lang="ts">
import type { Database } from "~~/types/db";

const props = defineProps<{
  race: Database.Race;
}>();

const { currentUserGroup } = await useGroup();

const nextRaceCutOffDate = computed(() =>
  props?.race?.qualifyingDate
    ? $getCutoffDate(
        props.race.qualifyingDate,
        currentUserGroup.value?.cutoffInMinutes,
      )
    : null,
);
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Predict the next race
  template(#footer)
    UButton(label="Tip now" to="/tipping/add-tips" trailing icon="carbon:arrow-right")
  .space-y-4
    .relative.overflow-hidden.py-4.-mx-4.-mt-5(class="sm:-mx-6 sm:-mt-6")
      AppImg.pointer-events-none.opacity-5.h-full.w-full.object-cover.inset-0.absolute(:src="COUNTRY_FLAGS[race.country]")
      .px-6
        .flex.items-center.justify-between.is-size-8.uppercase.text-muted
          p {{ "Round " + race.round }}
          p
            span {{ race.locality + ", " }}
            span {{ race.country }}
        p.is-display-5 {{ race.raceName }}
    .is-size-7(v-if="nextRaceCutOffDate")
      p.is-display-7.flex.items-center.gap-2
        | Tipping closes
        BadgeTimeTo(:date="nextRaceCutOffDate")
      .flex
        .pl-2
          p {{ nextRaceCutOffDate.toLocaleString(undefined, { hour: "numeric", minute: "2-digit"}) }}
          p {{ nextRaceCutOffDate.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" }) }}

</template>
