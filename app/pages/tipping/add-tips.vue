<script setup lang="ts">
import { FetchError } from "ofetch";
import { isBefore, formatDistanceToNowStrict } from "date-fns";
import { useNow } from "@vueuse/core";
import type { Database } from "~~/types/db";
import type { FormSubmitEvent } from "#ui/types";
import * as schemas from "~~/shared/schemas";
import type { z } from "zod";
import { getCutoffDate } from "~~/shared/utils";
import SystemError from "~/components/SystemError.vue";
import type { Race } from "~~/server/db/schema";
definePageMeta({
  layout: false,
});

const { currentUserGroup } = await useGroup();

function getCutoffDateForCurrentGroup(race: Database.Race): Date {
  return getCutoffDate(
    race.qualifyingDate,
    currentUserGroup.value?.cutoffInMinutes ?? 180,
  );
}

const { allRaces } = await useRace();
const { allDrivers: drivers } = await useDriver();
const { allConstructors: constructors } = await useConstructor();
const now = useNow();
const racesInTheFuture = computed(() => {
  const all = allRaces.value;
  return all?.filter((race) => {
    const lastChanceToEnterTips = getCutoffDateForCurrentGroup(race);
    return isBefore(now.value, lastChanceToEnterTips);
  });
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

const driverSelects: {
  modelKey: keyof typeof state;
  label: string;
  description: string;
  hint?: string;
}[] = [
  {
    modelKey: "pole",
    label: "Pole Position",
    description: "Which driver will start at the front?",
  },
  {
    modelKey: "p1",
    label: "P1",
    description: "Who will finish first in the GP?",
  },
  {
    modelKey: "p10",
    label: "P10",
    description: "Which driver will just snatch some points?",
  },
  {
    modelKey: "last",
    label: "Last place",
    description: "Who crosses the finish line last?",
    hint: "Excluding DNFs",
  },
];

const schema = schemas.saveTipp;

type Schema = z.infer<typeof schema>;
type ServerSchema = z.infer<typeof schemas.serverSaveTipp>;

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
        .is-container.flex.gap-4.items-center.is-container
          template(v-if="COUNTRY_FLAGS[currentRace.country]")
            .aspect-landscape.size-24.relative
              .absolute.inset-0.flex.items-center.justify-center
                NuxtImg.border.bg-faint.rounded(:src="COUNTRY_FLAGS[currentRace.country]")
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
              span {{ (getCutoffDateForCurrentGroup(currentRace)).toLocaleString(undefined, {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"}) }}
              span
                UBadge(color="gray")
                  span.is-size-8 In {{ formatDistanceToNowStrict(getCutoffDateForCurrentGroup(currentRace)) }}

          .gap-1(class="hidden sm:flex")
            UIcon(name="carbon:border-left")
            p.flex.flex-col.is-size-7
              span.is-display-8 Qualifying
              span {{ (currentRace.qualifyingDate).toLocaleString(undefined, {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"}) }}
              span
                UBadge(variant="soft" color="gray")
                  span.is-size-8 In {{ formatDistanceToNowStrict(currentRace.qualifyingDate) }}
          .gap-1(class="hidden sm:flex")
            UIcon(name="carbon:trophy")
            p.flex.flex-col.is-size-7
              span.is-display-8 Grand Prix
              span {{ (currentRace.grandPrixDate).toLocaleString(undefined, {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"}) }}
              span
                UBadge(variant="soft" color="gray")
                  span.is-size-8 In {{ formatDistanceToNowStrict(currentRace.grandPrixDate) }}

      section.pt-4.pb-2.flex.items-center.justify-between.is-container
        UButton(@click="goPrevious" :disabled="index === 0" variant="soft")
          | Previous
        UButton(@click="goNext" :disabled="racesInTheFuture?.length === (index + 1)" variant="soft")
          | Next

        
      section.is-container.py-4
        UForm.space-y-8(:schema :state @submit="onSubmit")
          template(v-for="{ modelKey, label, description, hint } in driverSelects" :id="modelKey")
            UFormGroup(:label :description :hint :name="modelKey")
              USelectMenu(:options="drivers?.sort((driverA, driverB) => driverA.familyName.localeCompare(driverB.familyName))" searchable option-attribute="fullName" v-model="state[modelKey]")
                template(#label)
                  .text-faint(v-if="!state[modelKey]") Pick a driver
                  div(v-else)
                    DriverOption(:option="state[modelKey]")
                template(#option="{ option }")
                  DriverOption(:option)
          UFormGroup(label="Most constructor points" description="Which constructor will haul the most points in the Grand Prix?" name="constructorWithMostPoints")
            USelectMenu(:options="constructors" searchable option-attribute="name" v-model="state.constructorWithMostPoints")
              template(#label)
                .text-faint(v-if="!state.constructorWithMostPoints") Pick a constructor
                div(v-else)
                  .flex.items-center.gap-2
                    NuxtImg.size-6(:src="`/img/constructors/${state.constructorWithMostPoints.id}.avif`")
                    span {{ state.constructorWithMostPoints.name }}
              template(#option="{ option }")
                .flex.items-center.gap-2
                  NuxtImg.size-6(:src="`/img/constructors/${option.id}.avif`")
                  span {{ option.name }}

          div
            UButton(block type="submit" :disabled="isSubmitPending" :loading="isSubmitPending") Save
          div(v-if="errorMessage")
            SystemError(:heading="fetchError ? undefined : errorMessage" :fetch-error)
</template>
