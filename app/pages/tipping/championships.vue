<script setup lang="ts">
import { FetchError } from "ofetch";
import { isFuture } from "date-fns";
import {
  saveChampionships as saveChampionshipSchema,
  serverSaveChampionships,
} from "~~/shared/schemas";
import type { Database } from "~~/types/db";
import type { FormSubmitEvent } from "#ui/types";
import type z from "zod";
import type { PredictionField } from "~~/types";

definePageMeta({
  layout: false,
});

const { currentUserGroup } = await useGroup();
const { allRaces } = await useRace();

const cutoffDate = computed(() => {
  const groupCutoff = currentUserGroup.value?.cutoffInMinutes;
  const firstRace = allRaces.value?.find((race) => race.round === 1);
  if (!firstRace) {
    return;
  }
  return $getCutoffDate(firstRace?.qualifyingDate, groupCutoff);
});

const isCutoffInFuture = computed(() =>
  !cutoffDate.value ? true : isFuture(cutoffDate.value),
);

const state = reactive({
  championshipConstructor: undefined as Database.Constructor | undefined,
  championshipDriver: undefined as Database.Driver | undefined,
}) satisfies Partial<Record<PredictionField, any>>;
const schema = saveChampionshipSchema;
type Schema = z.output<typeof schema>;
type ServerSchema = z.output<typeof serverSaveChampionships>;

const { add: addToast } = useToast();

const errorMessage = ref("");
const fetchError = ref<FetchError>();
const isSubmitPending = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  errorMessage.value = "";
  fetchError.value = undefined;
  isSubmitPending.value = true;

  if (!isCutoffInFuture.value) {
    addToast(
      $getErrorToast({
        title: "Too late!",
        description: "The voting period has already ended.",
      }),
    );
  }
  if (!currentUserGroup.value) {
    errorMessage.value = "You are not a member of a group";
    return;
  }

  const body: ServerSchema = {
    ...event.data,
    group: currentUserGroup.value,
  };

  try {
    const response = await $fetch("/api/prediction/add/championship", {
      method: "POST",
      body,
    });
    console.log(response);
    addToast(
      $getSuccessToast({
        title: "Saved your tip",
        description: `Your tips for the championships have been saved. Good luck!`,
      }),
    );
  } catch (e) {
    if (e instanceof FetchError) {
      fetchError.value = e;
    }
    console.error(e);
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    isSubmitPending.value = false;
  }
}

const { data: savedPredictions } = useFetch(
  () => `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    transform(predictionEntries) {
      const onlyChampionshipEntries = predictionEntries.filter((entry) =>
        ["championshipDriver", "championshipConstructor"].includes(
          entry.position,
        ),
      );
      return onlyChampionshipEntries.reduce(
        (acc, entry) => {
          const parsedEntry = {
            ...entry,
            createdAt: new Date(entry.createdAt),
          };
          // @ts-expect-error We checked for position constraint above
          acc[entry.position] = parsedEntry;
          return acc;
        },
        {} as Record<keyof typeof state, Database.PredictionEntry>,
      );
    },
  },
);

function setStateToEmpty() {
  Object.keys(state).forEach((key) => {
    const stateKey = key as keyof typeof state;
    state[stateKey] = undefined;
  });
}

const { allDrivers } = await useDriver();
const { allConstructors } = await useConstructor();

function populateStateFromSavedEntry() {
  // @ts-expect-error date mismatch
  state.championshipConstructor =
    allConstructors.value?.find(
      (constructor) =>
        constructor.id ==
        savedPredictions.value?.championshipConstructor?.constructorId,
    ) || undefined;

  // @ts-expect-error date mismatch
  state.championshipDriver =
    allDrivers.value?.find(
      (driver) =>
        driver.id == savedPredictions.value?.championshipDriver?.driverId,
    ) || undefined;
}

onMounted(() => {
  populateStateFromSavedEntry();
});

watchEffect(() => {
  setStateToEmpty();
  populateStateFromSavedEntry();
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Championships
  .is-page-height.is-container.space-y-8
    TextHero(:level="1" heading="Tip Championships" description="Guess the Constructors’ and Drivers’ Championships to secure extra points.")
    template(v-if="isCutoffInFuture && cutoffDate")
      .p-4.border.border-faint.rounded.inline-block
        p.is-display-7 Vote by
          BadgeTimeTo.ml-2(:date="cutoffDate")
        p {{ cutoffDate.toLocaleString(undefined, $localeDateTimeOptions) }}
    UForm.max-w-prose.space-y-4(:schema :state @submit="onSubmit")
      UFormGroup(label="Constructors’ Championship" name="championshipConstructor" description="Which team will score the most points to take home the Championship this season?" hint="10 points")
        SelectConstructor(v-model="state.championshipConstructor" :disabled="!isCutoffInFuture")
      UFormGroup(label="Drivers’ Championship" name="championshipDriver" description="Which driver will claim champion of the world this year?" hint="15 points")
        SelectDriver(v-model="state.championshipDriver" :disabled="!isCutoffInFuture")
      UButton(type="submit" label="Save" :disabled="!isCutoffInFuture")
</template>
