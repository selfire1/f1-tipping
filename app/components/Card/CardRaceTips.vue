<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

import { RACE_KEYS_TO_LABEL } from '~/utils/consts'
import type { RacePredictionField } from '~~/types'
import type { Database } from '~~/types/db'
import UserAvatar from '../UserAvatar.vue'
const props = defineProps<{
  race: Omit<Database.Race, 'lastUpdated' | 'created'>
}>()

const { currentUserGroup } = await useGroup()
const { data, status } = await useFetch(
  `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    lazy: true,
    query: {
      entireGroup: true,
      raceId: props.race.id,
    },
    ...$getCachedFetchConfig('all predictions'),
    transform: (entries) => {
      return reduceIntoObject(entries)
    },
  },
)

const { user } = await useAuthUser()
const { reduceIntoObject } = usePrediction()

const items = computed(() => {
  return Object.entries(data.value ?? {}).map(
    ([position, predictions], index) => {
      const item: AccordionItem = {
        label: RACE_KEYS_TO_LABEL[position as RacePredictionField],
        value: position,
        defaultOpen: !index,
        predictions: predictions.sort((a, b) =>
          a.userName.localeCompare(b.userName),
        ),
      }
      return item
    },
  )
})
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Race tips
  template(v-if='status === "idle" || status === "pending"')
    .space-y-4
      USkeleton.h-12.w-full(v-for='i in 3', :key='i')
  template(v-else-if='!items?.length')
    p.text-muted None found.
  template(v-else)
    UAccordion(
      :items='items',
      :default-value='items[0]?.value ? [items[0]?.value] : []',
      type='multiple'
    )
      template(#body='{ item }')
        template(v-for='prediction in item.predictions', :key='prediction.id')
          .grid.grid-cols-2.items-center.gap-2.p-1(
            :class='prediction.userName !== user?.name ? "" : "border border-accented"'
          )
            p.is-display-7.truncate {{ prediction.userName }}
            .is-size-7
              template(v-if='"familyName" in prediction.value')
                DriverOption(:option='prediction.value', short)
              template(v-else)
                ConstructorOption(:option='prediction.value')
</template>
