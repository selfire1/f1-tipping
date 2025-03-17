<script setup lang="ts">
import type { AccordionItem } from "#ui/types";
import { RACE_KEYS_TO_LABEL } from "~/utils/consts";
import type { Component, RacePredictionField } from "~~/types";
import type { Database } from "~~/types/db";
import DriverOption from "../DriverOption.vue";
const props = defineProps<{
  race: Omit<Database.Race, "lastUpdated" | "created">;
}>();

const { currentUserGroup } = await useGroup();
const { data, status } = await useFetch(
  `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    lazy: true,
    query: {
      entireGroup: true,
      raceId: props.race.id,
    },
    ...$getCachedFetchConfig("all predictions"),
    transform: (entries) => {
      return reduceIntoObject(entries);
    },
  },
);

const { user } = await useAuthUser();
const { reduceIntoObject } = usePrediction();

const items = computed(() => {
  return Object.entries(data.value ?? {}).map(
    ([position, predictions], index) => {
      const item: AccordionItem = {
        label: RACE_KEYS_TO_LABEL[position as RacePredictionField],
        defaultOpen: !index,
        content: predictions.sort((a, b) =>
          a.userName.localeCompare(b.userName),
        ),
      };
      return item;
    },
  );
});
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Race tips
  template(v-if="status === 'idle' || status === 'pending'")
    .space-y-4
      USkeleton.w-full.h-12(v-for="i in 3" :key="i")
  template(v-else-if="!items?.length")
    p.text-muted None found.
  template(v-else)
    UAccordion(:items="items" multiple)
      template(#item="{ item }")
        template(v-for="prediction in item.content" :key='prediction.id')
          .border.p-1.grid.grid-cols-2.gap-2(:class="prediction.userName !== user?.name ? 'border-transparent': ''")
            p.is-display-7.truncate {{ prediction.userName }}
            .is-size-7
              template(v-if="'familyName' in prediction.value")
                DriverOption(:option="prediction.value")
              template(v-else)
                ConstructorOption(:option="prediction.value")

</template>
