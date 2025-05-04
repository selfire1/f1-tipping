<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'
import { RACE_KEYS_TO_LABEL } from '~/utils/consts'
import type { RacePredictionField } from '~~/types'
import type { Database } from '~~/types/db'

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
  const positionToConstructorId = {} as Record<RacePredictionField, string[]>
  return Object.entries(data.value ?? {})
    .map(([position, predictions]) => {
      const item: AccordionItem = {
        label: RACE_KEYS_TO_LABEL[position as RacePredictionField],
        value: position,
        predictions: predictions
          ?.reduce(
            (acc, prediction) => {
              // @ts-expect-error `constructorId` doesn't always exist on prediction
              const constructorId = prediction?.value?.constructorId
              const value = constructorId || prediction?.value?.id

              const constructorHasBeenInCategory = acc.find(
                (el) =>
                  // @ts-expect-error `constructorId` doesn't always exist on prediction
                  el?.value?.constructorId ===
                    // @ts-expect-error `constructorId` doesn't always exist on prediction
                    prediction?.value?.constructorId &&
                  el.value?.id !== prediction?.value?.id,
              )
              const isCurrentUser = prediction.userName === user?.name
              const colourStart = $getConstructorCssVariable(
                value,
                isCurrentUser ? 0.3 : 0.05,
              )
              const colourEnd = $getConstructorCssVariable(
                value,
                isCurrentUser ? 0.3 : 0.2,
              )
              const style = {
                'background-image': `linear-gradient(to ${!constructorHasBeenInCategory ? 'right' : 'left'}, ${colourStart} , ${colourEnd})`,
              }

              console.log(positionToConstructorId)
              acc.push({ ...prediction, style })
              return acc
            },
            [] as Array<
              (typeof predictions)[number] & { style: Record<string, string> }
            >,
          )
          .sort((a, b) => a.userName.localeCompare(b.userName)),
      }
      return item
    })
    .sort(
      (a, b) =>
        RACE_PREDICTION_FIELDS.indexOf(a.value as RacePredictionField) -
        RACE_PREDICTION_FIELDS.indexOf(b.value as RacePredictionField),
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
        .divide-y(class='divide-primary/10')
          template(
            v-for='prediction in item.predictions',
            :key='prediction.id'
          )
            .grid.grid-cols-2.items-center.gap-2.p-2(:style='prediction.style')
              p.is-display-7.truncate {{ prediction.userName }}
              .is-size-7
                template(v-if='"familyName" in prediction.value')
                  DriverOption(:option='prediction.value', short)
                template(v-else)
                  ConstructorOption(:option='prediction.value')
</template>
