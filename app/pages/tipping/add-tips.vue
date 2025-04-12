<script setup lang="ts">
import { FetchError } from 'ofetch'
import type { Database } from '~~/types/db'
import type { FormSubmitEvent } from '#ui/types'
import * as schemas from '~~/shared/schemas'
import type { z } from 'zod'
import type { Race } from '~~/server/db/schema'
import type { Component } from '~~/types'
import { Icons } from '~/utils/consts'
definePageMeta({
  layout: false,
})

const {
  currentUserGroup,
  getCutoffForCurrentGroup: getCutoffDateForCurrentGroup,
} = await useGroup()

const { getRacesInTheFuture, deserialise } = useRace()
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
    currentUserGroup.value?.cutoffInMinutes,
  ),
)
const index = ref(0)
const currentRace = computed(() => racesInTheFuture.value?.[index.value])

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
  constructorWithMostPoints: undefined as Database.Constructor | undefined,
})

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

const schema = schemas.saveTip

type Schema = z.infer<typeof schema>
type ServerSchema = z.infer<typeof schemas.serverSaveTip>

const errorMessage = ref('')
const fetchError = ref<FetchError>()
const isSubmitPending = ref(false)

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
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
  // @ts-expect-error Types are fine.
  predictionsByRaceMap.value?.set(currentRace.value.id, event.data)
  try {
    const response = await $fetch('/api/prediction/add', {
      method: 'POST',
      body,
    })
    console.log(response)
    toast.add(
      $getSuccessToast({
        title: 'Tips saved',
        description: `Your tips for the ${currentRace.value.raceName} have been saved. Good luck!`,
      }),
    )
  } catch (e) {
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

const hasUnsavedChanges = computed(() => {
  if (!currentRace.value || !state) {
    // if empty, save is required
    return true
  }
  const serverValues = predictionsByRaceMap.value?.get(currentRace?.value?.id)
  if (!serverValues) {
    // if no values saved yet, treat as unsaved
    return true
  }
  const isSame = Object.entries(state).every(([key, value]) => {
    const serverValue = serverValues[key as keyof typeof serverValues]
    return serverValue?.id === value?.id
  })
  return !isSame
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
                AppImg.rounded.border.bg-faint(
                  :src='COUNTRY_FLAGS[currentRace.country]'
                )
          .w-full
            .is-size-8.flex.items-center.justify-between.uppercase.text-muted
              p {{ 'Round ' + currentRace.round }}
              p.hidden(class='sm:block') {{ currentRace.circuitName }}
            h1.is-display-4 {{ currentRace.raceName }}

        .is-container.grid(class='sm:grid-cols-3')
          .flex.gap-1
            UIcon(name='carbon:edit')
            p.is-size-7.flex.flex-col
              span.is-display-8 Tips due
              span {{ getCutoffDateForCurrentGroup(currentRace.qualifyingDate).toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(
                  :date='getCutoffDateForCurrentGroup(currentRace.qualifyingDate)'
                )

          .hidden.gap-1(class='sm:flex')
            UIcon(:name='Icons.Qualifying')
            p.is-size-7.flex.flex-col
              span.is-display-8 Qualifying
              span {{ currentRace.qualifyingDate.toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(
                  :badge='{ variant: "soft", color: "gray" }',
                  :date='currentRace.qualifyingDate'
                )
          .hidden.gap-1(class='sm:flex')
            UIcon(:name='Icons.GrandPrix')
            p.is-size-7.flex.flex-col
              span.is-display-8 Grand Prix
              span {{ currentRace.grandPrixDate.toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(
                  :badge='{ variant: "soft", color: "gray" }',
                  :date='currentRace.grandPrixDate'
                )

      section.is-container.flex.items-center.justify-between.pb-2.pt-4
        UButton(@click='goPrevious', :disabled='index === 0', variant='soft')
          | Previous
        UButton(
          @click='goNext',
          :disabled='racesInTheFuture?.length === index + 1',
          variant='soft'
        )
          | Next

      section.is-container.py-8
        UForm.space-y-6(:schema, :state, @submit='onSubmit')
          UFormGroup(
            label='Pole Position',
            description='Which driver will start at the front?',
            name='pole'
          )
            SelectDriver(v-model='state.pole', :drivers)
          UFormGroup(
            label='P1',
            description='Who will finish first in the GP?',
            name='p1'
          )
            SelectDriver(v-model='state.p1', :drivers)
          UFormGroup(
            label='P10',
            description='Which driver will just snatch some points?',
            name='p10'
          )
            SelectDriver(v-model='state.p10', :drivers)
          UFormGroup(label='Last place', name='last', hint='Excluding DNFs')
            template(#description)
              p Which driver is last to finish?
            SelectDriver(v-model='state.last', :drivers)
          UFormGroup(
            label='Most constructor points',
            description='Which constructor will haul the most points in the Grand Prix?',
            name='constructorWithMostPoints'
          )
            SelectConstructor(v-model='state.constructorWithMostPoints')

          div
            UButton(
              block,
              type='submit',
              :disabled='isSubmitPending || !hasUnsavedChanges',
              :loading='isSubmitPending',
              :icon='hasUnsavedChanges ? "" : "carbon:checkmark"'
            )
              template(v-if='isSubmitPending')
                | Saving…
              template(v-else-if='hasUnsavedChanges')
                | Save
              template(v-else)
                | Saved
          p.is-size-8.text-center.text-muted 1 point is awarded per correct answer.
          div(v-if='errorMessage')
            SystemError(
              :heading='fetchError ? undefined : errorMessage',
              :fetch-error
            )
      .h-72
</template>
