import type { Component, RacePredictionField } from '~~/types'
import type { Database } from '~~/types/db'
import type { SerializeObject } from 'nitropack'

export const usePrediction = () => {
  return {
    reduceIntoObject(entries: SerializeObject<Database.PredictionEntry>[]) {
      return entries.reduce(
        (acc, entry) => {
          const position = entry.position as RacePredictionField
          const mappedEntry = {
            id: entry.id,
            // @ts-expect-error Exists with this query
            userName: entry.prediction.user.name,
            position,
            // @ts-expect-error Exists with this query
            value: entry.driver || entry.constructor,
          }
          if (!acc[position]) {
            acc[position] = [mappedEntry]
            return acc
          }
          acc[position].push(mappedEntry)
          return acc
        },
        {} as Record<
          RacePredictionField,
          {
            id: string
            userName: string
            position: RacePredictionField
            value: Component.DriverOption | Database.Constructor | null
          }[]
        >,
      )
    },
  }
}
