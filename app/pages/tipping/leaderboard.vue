<script setup lang="ts">
import ConstructorOption from '~/components/ConstructorOption.vue'
import UserAvatar from '~/components/UserAvatar.vue'
import { Database } from '~~/types/db'

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Results',
  ogTitle: 'Results',
})

const { racesWithResults, statuses, results, leaderboard, getPositionArray } =
  await useResults()
const topPoints = computed(() => {
  return getPositionArray(leaderboard.value)
})

function getPlace(points: number) {
  return topPoints.value.indexOf(points) + 1
}

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

const predictionsByUser = computed(() => {
  return currentRacePredictions.value?.reduce((driverMap, el) => {
    const {
      driverId,
      position,
      // @ts-expect-error incorrect type
      prediction: { user },
    } = el
    if (!driverId) {
      return driverMap
    }
    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, new Map([[position, [user]]]))
      return driverMap
    }
    const positionMap = driverMap.get(driverId)
    const existing = positionMap.get(position)
    positionMap.set(position, [...(existing || []), user])
    return driverMap
  }, new Map())
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

const leaderboardColumns = [
  {
    key: 'place',
    label: 'Place',
  },
  {
    key: 'user',
    label: 'Name',
  },
  {
    key: 'points',
    label: 'Points',
  },
  {
    key: 'change',
    label: 'Delta',
  },
]

const constructorColumns = [
  { key: 'points', label: 'Points' },
  { key: 'constructor', label: 'Constructor' },
  { key: 'users', label: 'Predictions' },
]

const gpColumns = [
  { key: 'place', label: 'Place' },
  { key: 'driver', label: 'Driver' },
  { key: 'predictions', label: 'Predictions' },
]
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Results
  .is-page-height.space-y-12
    template(
      v-if='statuses.some((status) => ["pending", "idle"].includes(status.value))'
    )
      .is-container.space-y-12
        USkeleton.h-60.w-full
        .space-y-4
          template(v-for='i in 6', :key='i')
            USkeleton.h-12.w-full
    template(v-else-if='!results')
      .is-container.py-4.text-center
        h2.is-display-6 No results available
        p.text-muted Please check back later.
    template(v-else)
      .is-container
        UCard
          template(#header)
            h2.is-display-6 Leaderboard
          UTable(:columns='leaderboardColumns', :rows='leaderboard')
            template(#place-data='{ row }')
              template(v-if='getPlace(row.points) === 1')
                UBadge
                  | {{ '🥇 ' + getPlace(row.points) }}
                  | .
              template(v-else-if='getPlace(row.points) === 2')
                UBadge(variant='outline')
                  | {{ '🥈 ' + getPlace(row.points) }}
                  | .
              template(v-else-if='getPlace(row.points) === 3')
                UBadge(variant='subtle')
                  | {{ '🥉 ' + getPlace(row.points) }}
                  | .
              template(v-else)
                UBadge(
                  variant='soft',
                  :ui='{ variant: { soft: "bg-transparent" } }'
                ) {{ getPlace(row.points) + '.' }}

            template(#change-data='{ row: { delta } }')
              template(v-if='delta !== null')
                template(v-if='delta === 0')
                  UIcon.bg-gray-500(name='carbon:subtract')
                template(v-else-if='delta > 0')
                  .flex.items-center.gap-1.text-green-500
                    UIcon.is-display-7(name='carbon:arrow-up')
                    p.is-display-8 {{ delta }}
                template(v-else-if='delta < 0')
                  .flex.items-center.gap-1.text-red-500
                    UIcon.is-display-7(name='carbon:arrow-down')
                    p.is-display-8 {{ delta }}
            template(#user-data='{ row: { user } }')
              .flex.items-center.gap-2
                UserAvatar(:user)
                p {{ user.name }}
            template(#points-data='{ row: { points, pointsDelta } }')
              .flex.items-center.gap-2
                UBadge(
                  variant='soft',
                  :ui='{ variant: { soft: "bg-transparent" } }',
                  :label='points'
                )
                template(v-if='pointsDelta !== null')
                  template(v-if='pointsDelta > 0')
                    UBadge(color='green', variant='soft') +{{ pointsDelta }}
                  template(v-else)
                    UBadge(
                      color='orange',
                      variant='soft',
                      :ui='{ variant: { soft: "bg-transparent" } }'
                    ) {{ pointsDelta }}
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
              UTable(:rows='gpResults', :columns='gpColumns')
                template(#predictions-data='{ row }')
                  .grid.grid-cols-3
                    div
                      template(v-if='row.predictedP1By?.length')
                        p.is-display-7 P1
                        .flex.gap-1
                          template(
                            v-for='item in row.predictedP1By',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.isP1Correct ? "green" : "gray"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.isP1Correct ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                    div
                      template(v-if='row.predictedP10By?.length')
                        p.is-display-7 P10
                        .flex.gap-1
                          template(
                            v-for='item in row.predictedP10By',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.isP10Correct ? "green" : "gray"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.isP10Correct ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                    div
                      template(v-if='row.predictedLast?.length')
                        p.is-display-7 Last
                        .flex.gap-1
                          template(
                            v-for='item in row.predictedLast',
                            :key='item.name'
                          )
                            UTooltip(:text='item.name')
                              UChip(
                                inset,
                                :color='row.isLastCorrect ? "green" : "gray"',
                                position='bottom-right',
                                size='md'
                              )
                                template(#content)
                                  UIcon(
                                    :name='row.isLastCorrect ? "carbon:checkmark" : "carbon:close"'
                                  )
                                UAvatar(
                                  :alt='item.name',
                                  :src='$getUserImgSrc(item)'
                                )
                template(#driver-data='{ row }')
                  DriverOption(
                    :option='row.driver',
                    short,
                    :class='{ "opacity-50": !row.didAnyonePredict }'
                  )

            div
              h3.is-display-6.inline-flex.items-center.gap-1
                UIcon(:name='Icons.Qualifying')
                | Qualifying
              UTable(:rows='qualifyingResults', :columns='gpColumns')
                template(#predictions-data='{ row }')
                  template(v-if='row.predictedP1By?.length')
                    .flex.gap-1
                      template(
                        v-for='item in row.predictedP1By',
                        :key='item.name'
                      )
                        UTooltip(:text='item.name')
                          UChip(
                            inset,
                            :color='row.isP1Correct ? "green" : "gray"',
                            position='bottom-right',
                            size='md'
                          )
                            template(#content)
                              UIcon(
                                :name='row.isP1Correct ? "carbon:checkmark" : "carbon:close"'
                              )
                            UAvatar(
                              :alt='item.name',
                              :src='$getUserImgSrc(item)'
                            )
                template(#driver-data='{ row }')
                  DriverOption(:option='row.driver', short)
            .space-y-4
              TextHero(
                :level='3',
                heading='Constructors',
                description='With most points'
              )
              UTable(:rows='constructorResults', :columns='constructorColumns')
                template(#users-data='{ row }')
                  template(v-if='row.users?.length')
                    .flex.gap-1
                      template(v-for='item in row.users', :key='item.name')
                        UTooltip(:text='item.name')
                          UChip(
                            inset,
                            :color='row.isCorrect ? "green" : "gray"',
                            position='bottom-right',
                            size='md'
                          )
                            template(#content)
                              UIcon(
                                :name='row.isCorrect ? "carbon:checkmark" : "carbon:close"'
                              )
                            UAvatar(
                              :alt='item.name',
                              :src='$getUserImgSrc(item)'
                            )
                  template(v-else)
                    div
                template(#constructor-data='{ row }')
                  template(
                    v-if='["idle", "pending"].includes(constructorsStatus)'
                  )
                    USkeleton.h-8.w-full
                  template(v-else-if='constructorsMap?.has(row.constructorId)')
                    ConstructorOption(
                      :option='constructorsMap?.get(row.constructorId)'
                    )
                  template(v-else)
                    p {{ row.constructorId }}

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
