import type { Database } from '~~/types/db'
import type { Component } from '~~/types'

export const useResults = async () => {
  const { currentUserGroup } = await useGroup()
  const { data: allPredictions } = await useFetch(
    () => `/api/prediction/${currentUserGroup.value?.id}/getAll`,
    {
      ...$getCachedFetchConfig('allPredictions'),
    },
  )

  const { data: groupMembers } = await useFetch(
    () => `/api/group/get/${currentUserGroup.value?.id}/users`,
    {
      ...$getCachedFetchConfig('groupMembers'),
      transform: (data) => data.items,
    },
  )
  const racesWithResults = computed(() => {
    return races.value?.items
      ?.filter((race) => results.value?.has(race.id))
      ?.sort((a, b) => b.round - a.round)
  })
  const { data: races, status: racesStatus } = await useFetch('/api/races', {
    ...$getCachedFetchConfig('races'),
  })
  const { data: results, status: resultsStatus } = await useLazyFetch(
    '/api/results',
    {
      ...$getCachedFetchConfig('results'),
      transform(results) {
        if (!results?.items?.length) {
          return
        }

        const resultsMap = new Map<
          Database.Race['id'],
          {
            qualifying: Map<number, Component.DriverOption>
            gp: Map<number, Component.DriverOption>
            allConstructorsPoints: Map<Database.Result['constructorId'], number>
            topConstructorsPoints: Map<Database.Result['constructorId'], number>
          }
        >()
        results.items.forEach((result) => {
          const isRaceInMap = resultsMap.has(result.raceId)
          if (!isRaceInMap) {
            resultsMap.set(result.raceId, {
              // driverPositions: new Map<RacePredictionField, Database.Result>(),
              allConstructorsPoints: new Map<
                Database.Constructor['id'],
                number
              >(),
              topConstructorsPoints: new Map<
                Database.Constructor['id'],
                number
              >(),
              qualifying: new Map<number, Component.DriverOption>(),
              gp: new Map<number, Component.DriverOption>(),
            })
          }

          const raceObj = resultsMap.get(result.raceId)
          // @ts-expect-error
          raceObj!.qualifying.set(result.grid ?? 0, result.driver ?? {})
          if (result.position && result.position > 0) {
            // @ts-expect-error
            raceObj!.gp.set(result.position, result.driver ?? {})
          }

          const constructorsMap = raceObj!.allConstructorsPoints
          if (!constructorsMap.has(result.constructorId)) {
            constructorsMap.set(result.constructorId, 0)
          }
          const currentConstructorPoints =
            constructorsMap.get(result.constructorId)! + result.points
          constructorsMap.set(result.constructorId, currentConstructorPoints)

          const topConstructors = raceObj!.topConstructorsPoints

          const currentMaxPoints = Math.max(...constructorsMap.values())
          if (currentConstructorPoints >= currentMaxPoints) {
            topConstructors.set(result.constructorId, currentConstructorPoints)
            topConstructors.forEach((value, key) => {
              if (value < currentConstructorPoints) {
                topConstructors.delete(key)
              }
            })
          }
        })
        return resultsMap
      },
    },
  )
  const leaderboard = computed(() => {
    const membersMap = groupMembers.value?.reduce((map, user) => {
      map.set(user.id, {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        points: 0,
      })
      return map
    }, new Map<Database.User['id'], Database.User & { points: number }>())
    const resultsMap = results.value
    if (!resultsMap) {
      console.warn('No results')
      return []
    }

    const increaseUserPoints = (id: string) => {
      if (!membersMap?.has(id)) {
        return
      }
      const currentValue = membersMap.get(id)
      if (!currentValue) {
        return
      }
      membersMap.set(id, {
        ...currentValue,
        points: currentValue.points + 1,
      })
    }

    allPredictions.value?.forEach(
      ({ position, driverId, constructorId, raceId, userId }) => {
        if (!raceId) {
          console.warn('No race id')
          return
        }
        const raceMap = resultsMap.get(raceId)
        if (!raceMap) {
          console.info('No race map')
          return
        }
        if (position === 'constructorWithMostPoints') {
          const isCorrect = raceMap.topConstructorsPoints.has(
            constructorId ?? '',
          )
          if (!isCorrect) {
            return
          }
          increaseUserPoints(userId)
          return
        }
        const result = (() => {
          switch (position) {
            case 'p1':
              return raceMap.gp.get(1)
            case 'pole':
              return raceMap.qualifying.get(1)
            case 'p10':
              return raceMap.gp.get(10)
            case 'last':
              const sorted = [...raceMap.gp.entries()].sort(
                (a, b) => (a[0] || Infinity) - (b[0] || Infinity),
              )
              const [lastPlacePosition] = sorted.at(-1) ?? [1]
              return raceMap.gp.get(lastPlacePosition)
          }
        })()
        const isCorrect = result && result.id === driverId
        if (!isCorrect) {
          return
        }
        increaseUserPoints(userId)
      },
    )

    if (!membersMap) {
      return []
    }
    return [...membersMap.entries()]
      .map(([_userId, userInfo]) => {
        const { points, ...info } = userInfo
        return { points, user: info }
      })
      .sort(
        (a, b) => b.points - a.points || a.user.name.localeCompare(b.user.name),
      )
  })

  return {
    racesWithResults,
    results,
    statuses: [resultsStatus, racesStatus],
    leaderboard,
  }
}
