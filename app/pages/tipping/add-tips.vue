<script setup lang="ts">
import { isFuture } from 'date-fns'
import { FetchError } from 'ofetch'
import type { Database } from '~~/types/db'
import type { FormSubmitEvent } from '@nuxt/ui'
import { saveTip as schema } from '~~/shared/schemas'
import type { z } from 'zod'
import type { Race } from '~~/server/db/schema'
import type { Component, RacePredictionField } from '~~/types'
import { useTimeoutFn } from '@vueuse/core'
import { Icons } from '~/utils/consts'

definePageMeta({
  layout: false,
})

const { currentUserGroup } = await useGroup()

const { getRacesInTheFuture, deserialise, getIsSprintRace } = useRace()
const { data: races, status: raceStatus } = await useFetch('/api/races', {
  ...$getCachedFetchConfig('races'),
})
const { data: dbDrivers } = await useFetch('/api/drivers', {
  transform: (data) => data.items,
  ...$getCachedFetchConfig('drivers'),
})
if (!dbDrivers.value?.length) {
  throw createError({
    statusCode: 404,
    statusMessage: 'No drivers found',
  })
}
const drivers = dbDrivers as Ref<Database.Driver[]>

const racesInTheFuture = computed(() =>
  getRacesInTheFuture(
    races.value?.items?.map(deserialise),
    currentUserGroup.value,
  ),
)
const index = ref(0)
const currentRace = computed(() => racesInTheFuture.value?.[index.value])
const isCurrentSprintRace = computed(() =>
  !currentRace.value ? false : getIsSprintRace(currentRace.value),
)

function setStateToSaved() {
  setStateToEmpty()
  populateStateFromSavedEntry()
}

function goPrevious() {
  index.value = Math.max(0, index.value - 1)
  setStateToSaved()
}
function goNext() {
  index.value = Math.min(racesInTheFuture.value?.length ?? 0, index.value + 1)
  setStateToSaved()
}

const state = reactive({
  pole: undefined as Component.DriverOption | undefined,
  p1: undefined as Component.DriverOption | undefined,
  p10: undefined as Component.DriverOption | undefined,
  last: undefined as Component.DriverOption | undefined,
  sprintP1: undefined as Component.DriverOption | undefined,
  constructorWithMostPoints: undefined as Database.Constructor | undefined,
}) satisfies Record<RacePredictionField, any>

type State = typeof state

const { data: apiPredictions, status: savedStatus } = await useFetch(
  () => `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    transform(predictions) {
      return predictions.reduce((acc, entry) => {
        const raceId = entry.prediction.raceId as Race['id']
        const position = entry.position as keyof State
        const data: State[keyof State] =
          (entry.driver || entry.constructor) ?? undefined
        const stateLike = {
          [position]: data,
        }

        if (!acc.has(raceId)) {
          // @ts-expect-error Typescript doesn't know that `position` is the same as keyof State
          acc.set(raceId, stateLike)
          return acc
        }

        const existing = acc.get(raceId)
        // @ts-expect-error Typescript doesn't know that `position` is the same as keyof State
        acc.set(raceId, {
          ...existing,
          ...stateLike,
        })
        return acc
      }, new Map<Race['id'], State>())
    },
  },
)

const predictionsByRaceMap = ref(apiPredictions.value)

function setStateToEmpty() {
  Object.keys(state).forEach((key) => {
    const stateKey = key as keyof typeof state
    state[stateKey] = undefined
  })
}

function populateStateFromSavedEntry() {
  if (!currentRace.value) {
    return
  }
  const savedEntries = predictionsByRaceMap.value?.get(currentRace.value.id)
  if (!savedEntries) {
    return
  }
  setStateToEmpty()
  Object.entries(savedEntries).forEach(([key, value]) => {
    const stateKey = key as keyof State
    // @ts-expect-error Typescript doesn't know that `position` is the same as keyof State
    state[stateKey] = value
  })
}

onMounted(() => {
  populateStateFromSavedEntry()
})

type ClientSchema = z.infer<typeof schema.client>
type ServerSchema = z.infer<typeof schema.server>

const errorMessage = ref('')
const fetchError = ref<FetchError>()
const isSubmitPending = ref(false)

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<ClientSchema>) {
  errorMessage.value = ''
  fetchError.value = undefined
  isSubmitPending.value = true
  if (!currentUserGroup.value) {
    errorMessage.value = 'You are not a member of a group'
    return
  }
  if (!currentRace.value) {
    errorMessage.value = 'No race found'
    return
  }
  const body: ServerSchema = {
    ...event.data,
    group: currentUserGroup.value,
    race: currentRace.value,
  }
  try {
    const response = await $fetch('/api/prediction/add', {
      method: 'POST',
      body,
    })
    // @ts-expect-error Types are fine.
    predictionsByRaceMap.value?.set(currentRace.value.id, event.data)
    console.log(response)
    hasUnsavedChanges.value = false
    useTimeoutFn(
      () => {
        hasUnsavedChanges.value = true
      },
      5_000,
      { immediate: true },
    )

    toast.add(
      $getSuccessToast({
        title: 'Tips saved',
        description: `Your tips for the ${currentRace.value.raceName} have been saved. Good luck!`,
      }),
    )
  } catch (e) {
    toast.add(
      $getErrorToast({
        title: 'Couldn’t save',
        description: 'Something went wrong.',
      }),
    )
    if (e instanceof FetchError) {
      fetchError.value = e
    }
    console.error(e)
    errorMessage.value = 'Something went wrong. Please try again.'
  } finally {
    isSubmitPending.value = false
  }
}

useSeoMeta({
  title: 'Enter tips',
  ogTitle: 'Enter tips',
})

const hasUnsavedChanges = ref(true)

const disabledFieldMap = computed(() => {
  if (!currentRace.value || !currentUserGroup?.value) {
    return new Map()
  }
  const { isPositionAfterCutoff } = useCutoff({
    race: currentRace?.value,
    group: currentUserGroup?.value,
  })

  return RACE_PREDICTION_FIELDS.reduce(
    (acc, position) => {
      const isDisabled = isPositionAfterCutoff(position)
      acc.set(position, isDisabled)
      return acc
    },
    new Map() as Map<RacePredictionField, boolean>,
  )
})

const cutoffDates = computed(() => {
  if (!currentRace.value || !currentUserGroup?.value) {
    return
  }
  const { getCutoffDateForPosition } = useCutoff({
    race: currentRace?.value,
    group: currentUserGroup?.value,
  })
  return RACE_PREDICTION_FIELDS.reduce(
    (acc, position) => {
      const cutoffDate = getCutoffDateForPosition(position)
      acc[position] = cutoffDate
      return acc
    },
    {} as Record<RacePredictionField, Date | null>,
  )
})

const hasNoData = computed(() => {
  return Object.values(state).every((value) => !value)
})
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  .grid.grid-cols-2
  template(#page-title)
    | Enter tips
  template(
    v-if='raceStatus === "idle" || raceStatus === "pending" || savedStatus === "pending" || savedStatus === "idle"'
  )
    .is-page-height.space-y-12
      USkeleton.h-48.w-full.py-4
      .is-container.space-y-8
        template(v-for='i in 6', :key='i')
          USkeleton.h-24.w-full
  template(v-else-if='!currentRace')
    p.text-faint Didn't find a current race.
  template(v-else)
    .is-page-height.py-0
      section.is-bg-pattern.py-4
        .is-container.flex.items-center.gap-4
          template(
            v-if='currentRace.country && COUNTRY_FLAGS[currentRace.country]'
          )
            .aspect-landscape.relative.size-24
              .absolute.inset-0.flex.items-center.justify-center
                AppImg.bg-faint.rounded.border(
                  :src='COUNTRY_FLAGS[currentRace.country]'
                )
          .w-full
            .is-size-8.text-muted.flex.items-center.justify-between.uppercase
              p {{ 'Round ' + currentRace.round }}
              p.hidden(class='sm:block') {{ currentRace.circuitName }}
            h1.is-display-4 {{ currentRace.raceName }}

        .is-container.grid(class='sm:grid-cols-3', v-if='cutoffDates')
          .flex.gap-1
            UIcon(name='carbon:edit')
            p.is-size-7.flex.flex-col
              template(
                v-if='cutoffDates.sprintP1 && isFuture(cutoffDates.sprintP1)'
              )
                span.is-display-8 Sprint tips due
                .space-y-2
                  div
                    span {{ cutoffDates.sprintP1.toLocaleString(undefined, $localeDateTimeOptions) }}
                    span.ml-2
                      BadgeTimeTo(:date='cutoffDates.sprintP1')
                  template(v-if='cutoffDates.p1')
                    USeparator
                    div
                      span.is-display-8 GP tips due
                      div
                        span {{ cutoffDates.p1.toLocaleString(undefined, $localeDateTimeOptions) }}
                        span.ml-2
                          BadgeTimeTo(:date='cutoffDates.p1')
              template(v-else-if='cutoffDates.p1')
                span.is-display-8 Tips due
                span {{ cutoffDates.p1.toLocaleString(undefined, $localeDateTimeOptions) }}
                span
                  BadgeTimeTo(:date='cutoffDates.p1')

          .hidden.gap-1(class='sm:flex')
            UIcon(:name='Icons.Qualifying')
            p.is-size-7.flex.flex-col
              span.is-display-8 Qualifying
              span {{ currentRace.qualifyingDate.toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(
                  :badge='{ variant: "soft" }',
                  :date='currentRace.qualifyingDate'
                )
          .hidden.gap-1(class='sm:flex')
            UIcon(:name='Icons.GrandPrix')
            p.is-size-7.flex.flex-col
              span.is-display-8 Grand Prix
              span {{ currentRace.grandPrixDate.toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(
                  :badge='{ variant: "soft" }',
                  :date='currentRace.grandPrixDate'
                )

      section.is-container.flex.items-center.justify-between.pt-4.pb-2
        UButton(@click='goPrevious', :disabled='index === 0', variant='soft')
          | Previous
        UButton(
          @click='goNext',
          :disabled='racesInTheFuture?.length === index + 1',
          variant='soft'
        )
          | Next

      section.is-container.py-8
        UForm.space-y-6(:schema='schema.client', :state, @submit='onSubmit')
          template(v-if='isCurrentSprintRace')
            UFormField(
              label='Sprint P1',
              description='Who will win the sprint race?',
              name='sprintP1'
            )
              SelectDriver(
                v-model='state.sprintP1',
                :drivers,
                :disabled='disabledFieldMap.get("sprintP1")'
              )
          UFormField(
            label='Pole Position',
            description='Which driver will start at the front?',
            name='pole'
          )
            SelectDriver(
              v-model='state.pole',
              :drivers,
              :disabled='disabledFieldMap.get("pole")'
            )
          UFormField(
            label='P1',
            description='Who will finish first in the GP?',
            name='p1'
          )
            SelectDriver(
              v-model='state.p1',
              :drivers,
              :disabled='disabledFieldMap.get("p1")'
            )
          UFormField(
            label='P10',
            description='Which driver will just snatch some points?',
            name='p10'
          )
            SelectDriver(
              v-model='state.p10',
              :drivers,
              :disabled='disabledFieldMap.get("p10")'
            )
          UFormField(
            label='Last place',
            name='last',
            hint='Excluding early DNFs'
          )
            template(#description)
              p Which driver is last to finish?
            SelectDriver(
              v-model='state.last',
              :drivers,
              :disabled='disabledFieldMap.get("last")'
            )
          UFormField(
            label='Most constructor points',
            description='Which constructor will haul the most points in the Grand Prix?',
            name='constructorWithMostPoints'
          )
            SelectConstructor(
              v-model='state.constructorWithMostPoints',
              :disabled='disabledFieldMap.get("constructorWithMostPoints")'
            )

          div
            UButton(
              block,
              type='submit',
              :disabled='isSubmitPending || !hasUnsavedChanges || hasNoData',
              :loading='isSubmitPending',
              :icon='hasUnsavedChanges ? "" : Icons.HasTipped'
            )
              template(v-if='isSubmitPending')
                | Saving…
              template(v-else-if='hasUnsavedChanges')
                | Save
              template(v-else)
                | Saved
          p.is-size-8.text-muted.text-center 1 point is awarded per correct answer.
          div(v-if='errorMessage')
            SystemError(
              :heading='fetchError ? undefined : errorMessage',
              :fetch-error
            )
      .h-72
</template>
