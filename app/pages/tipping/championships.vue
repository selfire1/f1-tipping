<script setup lang="ts">
import { FetchError } from 'ofetch'
import { isFuture } from 'date-fns'
import { saveChampionships as schema } from '~~/shared/schemas'
import type { Database } from '~~/types/db'
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'
import type { ChampionshipPredictionField } from '~~/types'

definePageMeta({
  layout: false,
})

const { currentUserGroup } = await useGroup()
const { deserialise } = useRace()
const { data: allRaces } = await useFetch('/api/races', {
  ...$getCachedFetchConfig('races'),
  transform: (data) => data.items.map(deserialise),
})

const cutoffDate = computed(() => {
  const firstRace = allRaces.value?.find((race) => race.round === 1)
  if (!firstRace || !currentUserGroup.value) {
    return
  }
  const { getCutoffDateForPosition } = useCutoff({
    race: firstRace,
    group: currentUserGroup.value,
  })
  return getCutoffDateForPosition('p1')
})

const isCutoffInFuture = computed(() =>
  !cutoffDate.value ? true : isFuture(cutoffDate.value),
)

const state = reactive({
  championshipConstructor: undefined as Database.Constructor | undefined,
  championshipDriver: undefined as Database.Driver | undefined,
}) satisfies Record<ChampionshipPredictionField, any>
type ClientSchema = z.output<typeof schema.client>
type ServerSchema = z.output<typeof schema.server>

const { add: addToast } = useToast()

const errorMessage = ref('')
const fetchError = ref<FetchError>()
const isSubmitPending = ref(false)

async function onSubmit(event: FormSubmitEvent<ClientSchema>) {
  errorMessage.value = ''
  fetchError.value = undefined
  isSubmitPending.value = true

  if (!isCutoffInFuture.value) {
    addToast(
      $getErrorToast({
        title: 'Too late!',
        description: 'The voting period has already ended.',
      }),
    )
  }
  if (!currentUserGroup.value) {
    errorMessage.value = 'You are not a member of a group'
    return
  }

  const body: ServerSchema = {
    ...event.data,
    group: currentUserGroup.value,
  }

  try {
    const response = await $fetch('/api/prediction/add/championship', {
      method: 'POST',
      body,
    })
    console.log(response)
    addToast(
      $getSuccessToast({
        title: 'Saved your tip',
        description: `Your tips for the championships have been saved. Good luck!`,
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

const { data: savedPredictions } = await useFetch(
  () => `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    transform(predictionEntries) {
      const onlyChampionshipEntries = predictionEntries.filter((entry) =>
        ['championshipDriver', 'championshipConstructor'].includes(
          entry.position,
        ),
      )
      return onlyChampionshipEntries.reduce(
        (acc, entry) => {
          const parsedEntry = {
            ...entry,
            createdAt: new Date(entry.createdAt),
          }
          // @ts-expect-error We checked for position constraint above
          acc[entry.position] = parsedEntry
          return acc
        },
        {} as Record<keyof typeof state, Database.PredictionEntry>,
      )
    },
  },
)

function setStateToEmpty() {
  Object.keys(state).forEach((key) => {
    const stateKey = key as keyof typeof state
    state[stateKey] = undefined
  })
}

const { allDrivers } = await useDriver()
const { allConstructors } = await useConstructor()

function populateStateFromSavedEntry() {
  state.championshipConstructor =
    allConstructors.value?.find(
      (constructor) =>
        constructor.id ==
        savedPredictions.value?.championshipConstructor?.constructorId,
    ) || undefined

  state.championshipDriver =
    allDrivers.value?.find(
      (driver) =>
        driver.id == savedPredictions.value?.championshipDriver?.driverId,
    ) || undefined
}

onMounted(() => {
  populateStateFromSavedEntry()
})

watchEffect(() => {
  setStateToEmpty()
  populateStateFromSavedEntry()
})

useSeoMeta({
  title: 'Championships',
  ogTitle: 'Championships',
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
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Championships
  .is-page-height.is-container.space-y-8
    TextHero(
      :level='1',
      heading='Tip Championships',
      description='Guess the Constructors’ and Drivers’ Championships to secure extra points.'
    )
    template(v-if='isCutoffInFuture && cutoffDate')
      .border-faint.inline-block.rounded.border.p-4
        p.is-display-7 Vote by
          BadgeTimeTo.ml-2(:date='cutoffDate')
        p {{ cutoffDate.toLocaleString(undefined, $localeDateTimeOptions) }}
    UForm.max-w-prose.space-y-4(
      :schema='schema.client',
      :state,
      @submit='onSubmit'
    )
      UFormField(
        label='Constructors’ Championship',
        name='championshipConstructor',
        description='Which team will score the most points to take home the Championship this season?',
        hint='10 points'
      )
        SelectConstructor(
          v-model='state.championshipConstructor',
          :disabled='!isCutoffInFuture'
        )
      UFormField(
        label='Drivers’ Championship',
        name='championshipDriver',
        description='Which driver will claim champion of the world this year?',
        hint='15 points'
      )
        SelectDriver(
          v-model='state.championshipDriver',
          :disabled='!isCutoffInFuture',
          :drivers
        )
      UButton(type='submit', label='Save', :disabled='!isCutoffInFuture')
</template>
