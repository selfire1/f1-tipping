<script setup lang="ts">
import { Database } from '~~/types/db'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Results',
  ogTitle: 'Results',
})

const { racesWithResults, results } = await useResults()

const gpResults = computed(() => {
  if (!selectedRace.value) {
    return
  }
  const map = results.value?.get(selectedRace.value.id)?.gp
  if (!map) {
    return []
  }
  const sorted = [...map.entries()].sort(
    (a, b) => (a[0] || Infinity) - (b[0] || Infinity),
  )
  const [lastPlacePosition] = sorted.at(-1) ?? [1]
  return sorted.map(([place, driver]) => {
    const predictedP1By = predictionsByUser.value?.get(driver.id)?.get('p1')
    const predictedP10By = predictionsByUser.value?.get(driver.id)?.get('p10')
    const predictedLast = predictionsByUser.value?.get(driver.id)?.get('last')
    return {
      place,
      driver,
      predictedP1By,
      predictedP10By,
      predictedLast,
      didAnyonePredict: [predictedP1By, predictedP10By, predictedLast].some(
        (el) => el?.length,
      ),
      isP1Correct:
        place === 1 &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(1)?.id ===
          driver.id,
      isP10Correct:
        place === 10 &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(10)?.id ===
          driver.id,
      isLastCorrect:
        place === lastPlacePosition &&
        results.value?.get(selectedRace.value!.id)?.gp?.get(lastPlacePosition)
          ?.id === driver.id,
    }
  })
})
const constructorResults = computed(() => {
  if (!selectedRace.value) {
    return
  }
  const map = results.value?.get(selectedRace.value.id)?.allConstructorsPoints
  const topConstructors = results.value?.get(
    selectedRace.value.id,
  )?.topConstructorsPoints
  if (!map || !topConstructors) {
    return []
  }
  return [...map.entries()]
    .map(([constructorId, points]) => {
      const predictedThisConstructor = currentRacePredictions.value
        ?.filter(
          (prediction) =>
            prediction.position === 'constructorWithMostPoints' &&
            constructorId === prediction.constructorId,
        )
        // @ts-expect-error Type isn't coming through correctly
        .map((prediction) => prediction.prediction.user)
      return {
        points,
        constructorId,
        users: predictedThisConstructor,
        didAnyonePredict: predictedThisConstructor?.length,
        isCorrect: topConstructors.has(constructorId),
      }
    })
    .sort(
      (a, b) =>
        b.points - a.points || a.constructorId.localeCompare(b.constructorId),
    )
})

const qualifyingResults = computed(() => {
  if (!selectedRace.value) {
    return []
  }
  const map = results.value?.get(selectedRace.value.id)?.qualifying
  if (!map) {
    return []
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([place, driver]) => {
      const predictedP1By = predictionsByUser.value?.get(driver.id)?.get('pole')
      return {
        place,
        driver,
        predictedP1By,
        isP1Correct:
          place === 1 &&
          results.value?.get(selectedRace.value!.id)?.gp?.get(1)?.id ===
            driver.id,
      }
    })
    .filter((el) => el.place === 1 || el.predictedP1By?.length)
})

const sprintResults = computed(() => {
  if (!selectedRace.value) {
    return []
  }
  const map = results.value?.get(selectedRace.value.id)?.sprint
  if (!map) {
    return []
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([place, driver]) => {
      const predictedP1By = predictionsByUser.value
        ?.get(driver.id)
        ?.get('sprintP1')
      return {
        place,
        driver,
        predictedP1By,
        isP1Correct:
          place === 1 &&
          results.value?.get(selectedRace.value!.id)?.gp?.get(1)?.id ===
            driver.id,
      }
    })
    .filter((el) => el.place === 1 || el.predictedP1By?.length)
})

const predictionsByUser = computed(() => {
  return currentRacePredictions.value?.reduce((driverMap, el) => {
    const {
      driverId,
      position,
      // @ts-expect-error incorrect type
      prediction: { user: rawUser },
    } = el
    const user = rawUser as Pick<Database.User, 'id' | 'name' | 'image'>
    if (!driverId) {
      return driverMap
    }
    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, new Map([[position, [user]]]))
      return driverMap
    }
    const positionMap = driverMap.get(driverId)!
    const existing = positionMap.get(position)
    positionMap.set(position, [...(existing || []), user])
    return driverMap
  }, new Map<Database.Driver['id'], Map<(typeof PREDICTION_FIELDS)[number], Pick<Database.User, 'id' | 'name' | 'image'>[]>>())
})

const { data: constructorsMap, status: constructorsStatus } =
  await useLazyFetch('/api/constructors', {
    ...$getCachedFetchConfig('constructors'),
    transform(data) {
      const constructors = data.items
      return constructors.reduce((acc, constructor) => {
        acc.set(constructor.id, constructor)
        return acc
      }, new Map<Database.Constructor['id'], Database.Constructor>())
    },
  })

const selectedIndex = ref(0)
const selectedRace = computed(() => {
  return racesWithResults.value?.[selectedIndex.value]
})

function goPrevious() {
  selectedIndex.value = Math.max(0, selectedIndex.value - 1)
}
function goNext() {
  selectedIndex.value = Math.min(
    racesWithResults.value?.length ?? 0,
    selectedIndex.value + 1,
  )
}

const { currentUserGroup } = await useGroup()

const selectedRaceId = computed(() => selectedRace.value?.id)
const { data: currentRacePredictions, status: predictionStatus } =
  await useFetch(() => `/api/prediction/${currentUserGroup.value?.id}/get`, {
    query: {
      entireGroup: true,
      raceId: selectedRaceId,
    },
    ...$getCachedFetchConfig('all predictions'),
  })

const constructorColumns = [
  {
    id: 'points',
    header: 'Points',
    accessorKey: 'points',
  },
  { id: 'constructor', header: 'Constructor' },
  { id: 'users', header: 'Predictions' },
] satisfies TableColumn<
  NonNullable<(typeof constructorResults)['value']>[number]
>[]

const gpColumns = [
  {
    id: 'place',
    header: 'Place',
    accessorKey: 'place',
    cell: ({ row }) => `${row.original.place}.`,
  },
  { id: 'driver', header: 'Driver' },
  { id: 'predictions', header: 'Predictions' },
] satisfies TableColumn<NonNullable<(typeof gpResults)['value']>[number]>[]
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Results
  .is-page-height.space-y-12
    template(v-if='!results')
      .is-container.py-4.text-center
        h2.is-display-6 No results available
        p.text-muted Please check back later.
    template(v-else)
      .is-container
        ResultsLeaderbord
      section.space-y-12
        .is-bg-pattern.py-4
          .is-container.flex.items-center.justify-between
            UButton(
              @click='goNext',
              :disabled='racesWithResults?.length === selectedIndex + 1',
              variant='soft',
              label='Previous'
            )
            TextHero(:level='2', :heading='selectedRace?.raceName')
            UButton(
              type='button',
              @click='goPrevious',
              label='Next',
              variant='soft',
              :disabled='selectedIndex === 0'
            )
        template(
          v-if='[predictionStatus].some((status) => ["pending", "idle"].includes(status))'
        )
          .is-container.space-y-8
            template(v-for='i in 3', :key='i')
              USkeleton.h-60.w-full
        template(v-else)
          .is-container.space-y-12
            div
              h3.is-display-6.inline-flex.items-center.gap-1
                UIcon(:name='Icons.GrandPrix')
                | Grand Prix
              UTable(:data='gpResults', :columns='gpColumns')
                template(#predictions-cell='{ row }')
                  .grid.grid-cols-3
                    div
                      template(v-if='row.original.predictedP1By?.length')
                        p.is-display-7 P1
                        .flex.gap-1
                          template(
                            v-for='item in row.original.predictedP1By',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.original.isP1Correct ? "success" : "neutral"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.original.isP1Correct ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                    div
                      template(v-if='row.original.predictedP10By?.length')
                        p.is-display-7 P10
                        .flex.gap-1
                          template(
                            v-for='item in row.original.predictedP10By',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.original.isP10Correct ? "success" : "neutral"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.original.isP10Correct ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                    div
                      template(v-if='row.original.predictedLast?.length')
                        p.is-display-7 Last
                        .flex.gap-1
                          template(
                            v-for='item in row.original.predictedLast',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.original.isLastCorrect ? "success" : "neutral"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.original.isLastCorrect ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                template(#driver-cell='{ row }')
                  DriverOption(
                    :option='row.original.driver',
                    short,
                    :class='{ "opacity-50": !row.original.didAnyonePredict }'
                  )

            div
              h3.is-display-6.inline-flex.items-center.gap-1
                UIcon(:name='Icons.Qualifying')
                | Qualifying
              UTable(:data='qualifyingResults', :columns='gpColumns')
                template(#predictions-cell='{ row }')
                  ResultsUserRow(
                    :users='row.original.predictedP1By',
                    :is-correct='row.original.isP1Correct'
                  )
                template(#driver-cell='{ row }')
                  DriverOption(:option='row.original.driver', short)
            div(v-if='sprintResults?.length')
              h3.is-display-6.inline-flex.items-center.gap-1
                UIcon(:name='Icons.Sprint')
                | Sprint Race
              UTable(:data='sprintResults', :columns='gpColumns')
                template(#predictions-cell='{ row }')
                  ResultsUserRow(
                    :users='row.original.predictedP1By',
                    :is-correct='row.original.isP1Correct'
                  )
                template(#driver-cell='{ row }')
                  DriverOption(:option='row.original.driver', short)
            .space-y-4
              TextHero(
                :level='3',
                heading='Constructors',
                description='With most points'
              )
              UTable(:data='constructorResults', :columns='constructorColumns')
                template(#users-cell='{ row }')
                  ResultsUserRow(
                    :users='row.original.users',
                    :is-correct='row.original.isCorrect'
                  )
                template(#constructor-cell='{ row }')
                  template(
                    v-if='["idle", "pending"].includes(constructorsStatus)'
                  )
                    USkeleton.h-8.w-full
                  template(
                    v-else-if='constructorsMap?.has(row.original.constructorId)'
                  )
                    ConstructorOption(
                      :option='constructorsMap?.get(row.original.constructorId)'
                    )
                  template(v-else)
                    p {{ row.original.constructorId }}

        .is-bg-pattern.mt-8
          .is-container.flex.items-center.justify-between.py-2
            UButton(
              @click='goNext',
              :disabled='racesWithResults?.length === selectedIndex + 1',
              variant='soft',
              label='Previous'
            )
            p.is-display-7 {{ selectedRace?.raceName }}
            UButton(
              type='button',
              @click='goPrevious',
              label='Next',
              variant='soft',
              :disabled='selectedIndex === 0'
            )
</template>
