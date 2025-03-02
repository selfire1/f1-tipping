<script setup lang="ts">
import { USelectMenu } from "#components";
import { useRouteQuery } from "@vueuse/router";
import { formatDistanceToNowStrict } from "date-fns";
import DriverOption from "~/components/DriverOption.vue";
import type { Constructor, Driver } from "~~/types";

const { data: races } = await useFetch("/api/races");
const { data: drivers } = await useFetch("/api/drivers/get");
const { data: constructors } = await useFetch("/api/constructors/get");
const roundIndex = useRouteQuery("round", "1", { transform: Number });

const currentRace = computed(() => {
  const race = races.value?.find((race) => +race.round === roundIndex.value);
  if (!race) {
    return;
  }
  return {
    ...race,
    fullDate: new Date(race.date + "T" + race.time),
  };
});

function goPrevious() {
  roundIndex.value = Math.max(LOWEST_ROUND_NO, roundIndex.value - 1);
}
function goNext() {
  roundIndex.value = Math.min(HIGHEST_ROUND_NO, roundIndex.value + 1);
}

const state = reactive({
  drivers: {
    pole: undefined as Driver | undefined,
    p1: undefined as Driver | undefined,
    p10: undefined as Driver | undefined,
    last: undefined as Driver | undefined,
  },
  constructorWithMostPoints: undefined as Constructor | undefined,
});

const driverSelects: {
  modelKey: keyof typeof state.drivers;
  label: string;
  description: string;
  hint?: string;
}[] = [
  {
    modelKey: "pole",
    label: "Pole Position",
    description: "Which driver will start at the front?",
  },
  {
    modelKey: "p1",
    label: "P1",
    description: "Who will finish first in the GP?",
  },
  {
    modelKey: "p10",
    label: "P10",
    description: "Which driver will just snatch some points?",
  },
  {
    modelKey: "last",
    label: "Last place",
    description: "Who crosses the finish line last?",
    hint: "Excluding DNFs",
  },
];

function save() {
  // TODO: add
}
</script>

<template lang="pug">
.space-y-4
  template(v-if="!currentRace")
    //- TODO: handle missing race
  template(v-else)
    section.fixed.inset-x-0.bottom-0.z-10.bg-faint
      .is-container
        .px-4.py-4.flex.gap-4
          UButton(@click="goPrevious" :disabled="roundIndex === LOWEST_ROUND_NO") Previous
          UButton(@click="save") Save
          UButton(@click="goNext" :disabled="roundIndex === HIGHEST_ROUND_NO") Next

    section.is-bg-pattern.py-4
      .flex.gap-4.items-center.is-container
        template(v-if="COUNTRY_FLAGS[currentRace?.Circuit.Location.country]")
          .aspect-landscape.size-24.relative
            .absolute.inset-0.flex.items-center.justify-center
              NuxtImg.border.bg-faint.rounded(:src="COUNTRY_FLAGS[currentRace.Circuit.Location.country]")
        .w-full
          .flex.items-center.justify-between.is-size-8.uppercase
            p {{ "Round " + currentRace.round }}
            p {{ currentRace?.Circuit.circuitName }}
          h1.is-display-4 {{ currentRace?.raceName }}
          .flex.items-center.gap-2
            p.is-size-8 {{ currentRace.fullDate.toLocaleString() }}
            UBadge(variant="soft")
              span In {{ formatDistanceToNowStrict(currentRace.fullDate)}}

    .is-container
      section.py-4.space-y-8

        template(v-for="{ modelKey, label, description, hint } in driverSelects" :id="modelKey")
          UFormGroup(:label :description :hint)
            USelectMenu(:options="drivers" searchable option-attribute="fullName" v-model="state.drivers[modelKey]")
              template(#label)
                .text-faint(v-if="!state.drivers[modelKey]") Pick a driver
                div(v-else)
                  DriverOption(:option="state.drivers[modelKey]")
              template(#option="{ option }")
                DriverOption(:option)

        UFormGroup(label="Most constructor points" description="Which constructor will haul the most points in the Grand Prix?")
          USelectMenu(:options="constructors" searchable option-attribute="name" v-model="state.constructorWithMostPoints")
            template(#label)
              .text-faint(v-if="!state.constructorWithMostPoints") Pick a constructor
              div(v-else)
                .flex.items-center.gap-2
                  NuxtImg.size-6(:src="`/img/constructors/${state.constructorWithMostPoints.id}.avif`")
                  span {{ state.constructorWithMostPoints.name }}
            template(#option="{ option }")
              .flex.items-center.gap-2
                NuxtImg.size-6(:src="`/img/constructors/${option.id}.avif`")
                span {{ option.name }}


</template>
