import { z } from 'zod'

// utils
const requiredString = z.string().min(1, 'Required')
const idObject = z
  .object({
    id: requiredString,
  })
  .passthrough()

// group
export const createGroup = z.object({
  name: z.string().min(1, 'Required'),
})

// tip
const clientTip = z
  .object({
    pole: idObject,
    p1: idObject,
    p10: idObject,
    last: idObject,
    constructorWithMostPoints: idObject,
    sprintP1: idObject,
  })
  .partial()

export const saveTip = {
  client: clientTip,
  server: clientTip.extend({
    race: idObject,
    group: idObject,
  }),
}

// championships
const clientChampionship = z.object({
  championshipConstructor: idObject,
  championshipDriver: idObject,
})
export const saveChampionships = {
  client: clientChampionship,
  server: clientChampionship.extend({
    group: idObject,
  }),
}

// queries
export const getResultOptions = z.object({
  raceId: z.string().optional(),
})
