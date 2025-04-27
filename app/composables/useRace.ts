import { useNow } from '@vueuse/core'
import type { SerializeObject } from 'nitropack'
import type { Database } from '~~/types/db'

export const useRace = () => {
  // const nuxtApp = useNuxtApp();

  // const { data: apiRaces, status } = await useFetch("/api/races", {
  //   transform(data) {
  //     return data.items?.map((race) => ({
  //       ...race,
  //       grandPrixDate: new Date(race.grandPrixDate),
  //       qualifyingDate: new Date(race.qualifyingDate),
  //     }));
  //   },
  //   getCachedData: (key) => {
  //     const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
  //     console.log("races are in cache", !!inCache);
  //     return inCache;
  //   },
  //   lazy: true,
  // });

  return {
    deserialise(race: SerializeObject<Database.Race>): Database.Race {
      return {
        ...race,
        grandPrixDate: new Date(race.grandPrixDate),
        sprintQualifyingDate: !race.sprintQualifyingDate
          ? null
          : new Date(race.sprintQualifyingDate),
        sprintDate: !race.sprintDate ? null : new Date(race.sprintDate),
        qualifyingDate: new Date(race.qualifyingDate),
        created: new Date(race.created),
        lastUpdated: new Date(race.lastUpdated),
      }
    },
    getIsSprintRace: (race: Database.Race) => !!race.sprintDate,
    getRacesInTheFuture(
      maybeRefRaces?: MaybeRef<Database.Race[]>,
      group?: Pick<Database.Group, 'cutoffInMinutes'>,
    ): Database.Race[] {
      const races = unref(maybeRefRaces)
      if (!group) {
        return []
      }
      return (
        races
          ?.filter((race) => {
            const { getIsRaceAfterCutoff } = useCutoff({
              race,
              group,
            })
            return !getIsRaceAfterCutoff()
          })
          ?.map((race) => ({
            ...race,
            created: new Date(race.created),
            lastUpdated: new Date(race.lastUpdated),
          })) ?? []
      )
    },
  }
}
