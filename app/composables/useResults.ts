import type { Database } from '~~/types/db'
import type { Component } from '~~/types'
import type { InternalApi } from 'nitropack'

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

  const { data: resultsByRaceAndPosition, status: resultsStatus } =
    await useLazyFetch('/api/results', {
      ...$getCachedFetchConfig('results'),
      transform(results) {
        return mapResultsToMap(results)
      },
    })

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
    const resultsMap = resultsByRaceAndPosition.value
    if (!resultsMap) {
      console.warn('No results')
      return []
    }

    const increaseUserPoints = (userId: Database.User['id']) => {
      if (!membersMap?.has(userId)) {
        return
      }
      const currentValue = membersMap.get(userId)
      if (!currentValue) {
        return
      }
      membersMap.set(userId, {
        ...currentValue,
        points: currentValue.points + 1,
      })
    }

    allPredictions.value?.forEach(
      ({
        position: predictedPosition,
        driverId: predictedDriverId,
        constructorId,
        raceId,
        userId,
      }) => {
        if (!raceId) {
          console.warn('No race id')
          return
        }
        const raceResults = resultsMap.get(raceId)
        if (!raceResults) {
          console.info('No results found for race')
          return
        }
        if (predictedPosition === 'constructorWithMostPoints') {
          if (!constructorId) {
            return
          }
          const isCorrect = raceResults.topConstructorsPoints.has(constructorId)
          if (!isCorrect) {
            return
          }
          increaseUserPoints(userId)
          return
        }
        const result = (() => {
          switch (predictedPosition) {
            case 'p1':
              return raceResults.gp.get(1)
            case 'pole':
              return raceResults.qualifying.get(1)
            case 'p10':
              return raceResults.gp.get(10)
            case 'last':
              const sorted = [...raceResults.gp.entries()].sort(
                (a, b) => (a[0] || Infinity) - (b[0] || Infinity),
              )
              const [lastPlacePosition] = sorted.at(-1) ?? [1]
              return raceResults.gp.get(lastPlacePosition)
          }
        })()
        if (!result) {
          return
        }
        const isCorrect = result.id === predictedDriverId
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

  // get which races already have results
  const { data: racesWithResults, status: racesStatus } = await useFetch(
    '/api/races',
    {
      ...$getCachedFetchConfig('races'),
      transform: (data) => {
        const allRaces = data.items
        return allRaces
          ?.filter((race) => resultsByRaceAndPosition.value?.has(race.id))
          ?.sort((a, b) => b.round - a.round)
      },
    },
  )

  return {
    statuses: [resultsStatus, racesStatus],
    racesWithResults,
    results: resultsByRaceAndPosition,
    leaderboard,
  }
}

function mapResultsToMap(results: InternalApi['/api/results']['default']) {
  if (!results?.items?.length) {
    return
  }

  /**
   * the finishing position of the driver
   */
  type Position = number

  const resultsMap = new Map<
    /**
     * The id of the race
     */
    Database.Race['id'],
    {
      qualifying: Map<Position, Component.DriverOption>
      gp: Map<Position, Component.DriverOption>
      allConstructorsPoints: Map<Database.Result['constructorId'], number>
      topConstructorsPoints: Map<Database.Result['constructorId'], number>
    }
  >()
  results.items.forEach((result) => {
    const isRaceInMap = resultsMap.has(result.raceId)
    if (!isRaceInMap) {
      resultsMap.set(result.raceId, {
        // driverPositions: new Map<RacePredictionField, Database.Result>(),
        allConstructorsPoints: new Map<Database.Constructor['id'], number>(),
        topConstructorsPoints: new Map<Database.Constructor['id'], number>(),
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
}
