<script setup lang="ts">
import { FetchError } from "ofetch";
import type { Database } from "~~/types/db";
import type { FormSubmitEvent } from "#ui/types";
import * as schemas from "~~/shared/schemas";
import type { z } from "zod";
import { $getCutoffDate } from "~~/shared/utils";
import type { Race } from "~~/server/db/schema";
definePageMeta({
  layout: false,
});

const { currentUserGroup } = await useGroup();

function getCutoffDateForCurrentGroup(
  qualifyingDate: Database.Race["qualifyingDate"],
): Date {
  return $getCutoffDate(
    qualifyingDate,
    currentUserGroup.value?.cutoffInMinutes,
  );
}

const { getRacesInTheFuture } = await useRace();
const { allDrivers: drivers } = await useDriver();
const { allConstructors: constructors } = await useConstructor();
const racesInTheFuture = computed(() => {
  return getRacesInTheFuture(currentUserGroup.value?.cutoffInMinutes);
});
const index = ref(0);
const currentRace = computed(() => racesInTheFuture.value?.[index.value]);

function goPrevious() {
  index.value = Math.max(0, index.value - 1);
}
function goNext() {
  index.value = Math.min(racesInTheFuture.value?.length ?? 0, index.value + 1);
}

const state = reactive({
  pole: undefined as Database.Driver | undefined,
  p1: undefined as Database.Driver | undefined,
  p10: undefined as Database.Driver | undefined,
  last: undefined as Database.Driver | undefined,
  constructorWithMostPoints: undefined as Database.Constructor | undefined,
});

const { data: predictionsByRace } = useFetch(
  () => `/api/prediction/${currentUserGroup.value?.id}/get`,
  {
    transform(predictionEntries) {
      const groupedByRace = predictionEntries.reduce((acc, entry) => {
        // @ts-expect-error TODO: fix type error
        const raceId = entry.prediction.raceId as Race["id"];
        const position = entry.position;

        const parsedEntry = {
          ...entry,
          createdAt: new Date(entry.createdAt),
        };
        const insertObj = {
          [position]: parsedEntry,
        } as Record<
          Database.PredictionEntry["position"],
          Database.PredictionEntry
        >;

        if (!acc.has(raceId)) {
          acc.set(raceId, insertObj);
          return acc;
        }

        const existing = acc.get(raceId);
        acc.set(raceId, {
          ...existing,
          ...insertObj,
        });
        return acc;
      }, new Map<Race["id"], Record<Database.PredictionEntry["position"], Database.PredictionEntry>>());
      return groupedByRace;
    },
  },
);

function setStateToEmpty() {
  Object.keys(state).forEach((key) => {
    const stateKey = key as keyof typeof state;
    state[stateKey] = undefined;
  });
}

function populateStateFromSavedEntry() {
  if (!currentRace.value) {
    return;
  }
  const savedEntries = predictionsByRace.value?.get(currentRace.value.id);
  if (!savedEntries) {
    return;
  }
  Object.keys(state).forEach((key) => {
    const stateKey = key as keyof typeof state;
    const saved = savedEntries?.[stateKey] as Database.PredictionEntry;
    if (!saved) {
      return;
    }
    const newStateValue = saved.driverId
      ? drivers.value?.find((driver) => driver.id === saved.driverId)
      : constructors.value?.find(
          (constructor) => constructor.id === saved.constructorId,
        );
    if (!newStateValue) {
      return;
    }
    //@ts-expect-error TODO: type mismatch between constructor and driver
    state[stateKey] = newStateValue;
  });
}

onMounted(() => {
  populateStateFromSavedEntry();
});

watchEffect(() => {
  setStateToEmpty();
  populateStateFromSavedEntry();
});

const schema = schemas.saveTip;

type Schema = z.infer<typeof schema>;
type ServerSchema = z.infer<typeof schemas.serverSaveTip>;

const errorMessage = ref("");
const fetchError = ref<FetchError>();
const isSubmitPending = ref(false);

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  errorMessage.value = "";
  fetchError.value = undefined;
  isSubmitPending.value = true;
  if (!currentUserGroup.value) {
    errorMessage.value = "You are not a member of a group";
    return;
  }
  if (!currentRace.value) {
    errorMessage.value = "No race found";
    return;
  }
  const body: ServerSchema = {
    ...event.data,
    group: currentUserGroup.value,
    race: currentRace.value,
  };
  try {
    const response = await $fetch("/api/prediction/add", {
      method: "POST",
      body,
    });
    console.log(response);
    toast.add(
      $getSuccessToast({
        title: "Saved your tip",
        description: `Your tip for the ${currentRace.value.raceName} has been saved. Good luck!`,
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

useSeoMeta({
  title: "Enter tips",
  ogTitle: "Enter tips",
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Enter tips
  template(v-if="!currentRace")
    p.text-faint Didn't find a current race.
  template(v-else)
    .is-page-height.py-0
      section.py-4.is-bg-pattern
        .is-container.flex.gap-4.items-center
          RaceFlag(:country="currentRace.country")
          .w-full
            .flex.items-center.justify-between.is-size-8.uppercase.text-muted
              p {{ "Round " + currentRace.round }}
              p.hidden(class="sm:block") {{ currentRace.circuitName }}
            h1.is-display-4 {{ currentRace.raceName }}
        
        .is-container.grid(class="sm:grid-cols-3")
          .flex.gap-1
            UIcon(name="carbon:edit")
            p.flex.flex-col.is-size-7
              span.is-display-8 Tips due
              span {{ (getCutoffDateForCurrentGroup(currentRace.qualifyingDate)).toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(:date="getCutoffDateForCurrentGroup(currentRace.qualifyingDate)")

          .gap-1(class="hidden sm:flex")
            UIcon(name="carbon:border-left")
            p.flex.flex-col.is-size-7
              span.is-display-8 Qualifying
              span {{ (currentRace.qualifyingDate).toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(:badge="{variant: 'soft', color: 'gray'}" :date="currentRace.qualifyingDate")
          .gap-1(class="hidden sm:flex")
            UIcon(name="carbon:trophy")
            p.flex.flex-col.is-size-7
              span.is-display-8 Grand Prix
              span {{ (currentRace.grandPrixDate).toLocaleString(undefined, $localeDateTimeOptions) }}
              span
                BadgeTimeTo(:badge="{variant: 'soft', color: 'gray'}" :date="currentRace.grandPrixDate")

      section.pt-4.pb-2.flex.items-center.justify-between.is-container
        UButton(@click="goPrevious" :disabled="index === 0" variant="soft")
          | Previous
        UButton(@click="goNext" :disabled="racesInTheFuture?.length === (index + 1)" variant="soft")
          | Next

        
      section.is-container.py-8
        UForm.space-y-6(:schema :state @submit="onSubmit")
          UFormGroup(label="Pole Position" description="Which driver will start at the front?"  name="pole")
            SelectDriver(v-model="state.pole")
          UFormGroup(label="P1" description="Who will finish first in the GP?"  name="p1")
            SelectDriver(v-model="state.p1")
          UFormGroup(label="P10" description="Which driver will just snatch some points?"  name="p10")
            SelectDriver(v-model="state.p10")
          UFormGroup(label="Last place"  name="last" hint="Excluding DNFs")
            template(#description)
              p Which driver is last to finish?
            SelectDriver(v-model="state.last")
          UFormGroup(label="Most constructor points" description="Which constructor will haul the most points in the Grand Prix?" name="constructorWithMostPoints")
            SelectConstructor(v-model="state.constructorWithMostPoints")

          div
            UButton(block type="submit" :disabled="isSubmitPending" :loading="isSubmitPending") Save
          p.text-center.text-muted.is-size-8 1 point is awarded per correct answer.
          div(v-if="errorMessage")
            SystemError(:heading="fetchError ? undefined : errorMessage" :fetch-error)
</template>
