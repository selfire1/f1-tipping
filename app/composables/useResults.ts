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

  const { data: results, status: resultsStatus } = await useLazyFetch(
    '/api/results',
    {
      ...$getCachedFetchConfig('results'),
      transform: (data) => data.items,
    },
  )

  const resultsByRaceAndPosition = computed(() => {
    if (!results.value) {
      return new Map()
    }
    return getMapFromResults(results.value)
  })

  const leaderboard = computed(() => {
    if (
      !resultsByRaceAndPosition.value ||
      !allPredictions.value?.length ||
      !groupMembers.value?.length
    ) {
      console.warn(
        'No results for leaderboard.',
        resultsByRaceAndPosition.value,
        allPredictions.value,
        groupMembers.value,
      )
      return []
    }
    const lastRace = racesWithResults.value?.[0]
    return getLeaderboard(
      resultsByRaceAndPosition.value,
      allPredictions.value,
      groupMembers.value,
      {
        previousRaceId: lastRace?.id,
      },
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

  // MARK: composable return
  return {
    /**
     * The statuses of the fetch request
     */
    statuses: [resultsStatus, racesStatus],
    /**
     * Races that already have results
     */
    racesWithResults,
    /**
     * A map of results by race
     */
    results: resultsByRaceAndPosition,
    /**
     * An ordered list of users with points
     */
    leaderboard,
    getPositionArray,
  }

  /**
   * the finishing position of the driver
   */
  type Position = number
  type ResultsMap = Map<
    /**
     * The id of the race
     */
    Database.Race['id'],
    {
      qualifying: Map<Position, Component.DriverOption>
      sprint: Map<Position, Component.DriverOption> | null
      gp: Map<Position, Component.DriverOption>
      allConstructorsPoints: Map<Database.Result['constructorId'], number>
      topConstructorsPoints: Map<Database.Result['constructorId'], number>
    }
  >

  function getMapFromResults(
    results: InternalApi['/api/results']['default']['items'],
    // results?: Array<
    //   Omit<Database.Result, 'createdAt' | 'updatedAt' | 'addedAt'> & {
    //     driver: Database.Driver
    //   }
    // >,
  ): ResultsMap | undefined {
    if (!results?.length) {
      return
    }

    const resultsMap: ResultsMap = new Map()
    results.forEach((result) => {
      const isRaceInMap = resultsMap.has(result.raceId)
      const hasSprintResult = result.sprint

      if (!isRaceInMap) {
        resultsMap.set(result.raceId, {
          allConstructorsPoints: new Map<Database.Constructor['id'], number>(),
          topConstructorsPoints: new Map<Database.Constructor['id'], number>(),
          qualifying: new Map<number, Component.DriverOption>(),
          gp: new Map<number, Component.DriverOption>(),
          sprint: hasSprintResult
            ? new Map<number, Component.DriverOption>()
            : null,
        })
      }

      const raceMap = resultsMap.get(result.raceId)!
      if (result.driver) {
        raceMap.qualifying.set(result.grid ?? 0, result.driver)
      } else {
        console.warn('No driver for `grid`', result)
      }

      if (result.driver) {
        if (result.position && result.position > 0) {
          raceMap.gp.set(result.position, result.driver)
        }
      } else {
        console.warn('No driver for `position`', result)
      }

      if (result.sprint && result.sprint > 0) {
        if (!raceMap?.sprint) {
          raceMap.sprint = new Map<number, Component.DriverOption>()
        }

        if (result.driver) {
          raceMap.sprint.set(result.sprint, result.driver ?? {})
        } else {
          console.warn('No driver for `sprint`', result)
        }
      }

      const constructorsMap = raceMap!.allConstructorsPoints
      if (!constructorsMap.has(result.constructorId)) {
        constructorsMap.set(result.constructorId, 0)
      }
      const currentConstructorPoints =
        constructorsMap.get(result.constructorId)! + result.points
      constructorsMap.set(result.constructorId, currentConstructorPoints)

      const topConstructors = raceMap!.topConstructorsPoints

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

  type Leaderboard = {
    user: Database.User
    points: number
    delta: number | null
    pointsDelta: number | null
  }[]
  function getLeaderboard(
    resultsMap: ResultsMap,
    allPredictions: InternalApi['/api/prediction/:groupId/getAll']['default'],
    membersOfGroup: InternalApi['/api/group/get/:id/users']['default']['items'],
    options?: {
      previousRaceId?: Database.Race['id']
    },
  ): Leaderboard {
    if (!membersOfGroup?.length || !resultsMap || !allPredictions?.length) {
      return []
    }
    let memberToPreviousPositionMap = new Map<
      Database.User['id'],
      { position: number; points: number }
    >()
    const previousRaceId = options?.previousRaceId
    if (previousRaceId) {
      const clonedResultsMap = new Map(resultsMap)
      clonedResultsMap.delete(previousRaceId)
      const previousLeaderboard = getLeaderboard(
        clonedResultsMap,
        allPredictions.filter(
          (prediction) => prediction.raceId !== previousRaceId,
        ),
        membersOfGroup,
      )

      const previousPositions = getPositionArray(previousLeaderboard)
      previousLeaderboard.forEach((entry) => {
        memberToPreviousPositionMap.set(entry.user.id, {
          position: previousPositions.indexOf(entry.points),
          points: entry.points,
        })
      })
    }
    const membersMap = membersOfGroup.reduce((map, user) => {
      map.set(user.id, {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        points: 0,
        delta: null,
        pointsDelta: null,
      })
      return map
    }, new Map<Database.User['id'], Database.User & { points: number; delta: Leaderboard[number]['delta']; pointsDelta: Leaderboard[number]['pointsDelta'] }>())
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

    allPredictions.forEach(
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
        if (predictedPosition === 'sprintP1' && raceResults.sprint) {
          const tip = predictedDriverId
          const result = raceResults.sprint.get(1)
          const isCorrect = tip === result?.id
          if (!isCorrect) return
          increaseUserPoints(userId)
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

    const leaderboardArray = [...membersMap.entries()]
      .map(([_userId, userInfo]) => {
        const { points, delta, pointsDelta, ...info } = userInfo
        return { points, delta, pointsDelta, user: info }
      })
      .sort(
        (a, b) => b.points - a.points || a.user.name.localeCompare(b.user.name),
      )

    if (memberToPreviousPositionMap.size) {
      const positionArray = getPositionArray(leaderboardArray)
      leaderboardArray.forEach((entry) => {
        const currentPosition = positionArray.indexOf(entry.points)
        const previousPosition = memberToPreviousPositionMap.get(entry.user.id)
        if (!previousPosition) {
          return
        }
        if (previousPosition.position !== -1) {
          entry.delta =
            previousPosition === undefined
              ? null
              : previousPosition.position - currentPosition
        }
        entry.pointsDelta = entry.points - previousPosition.points
      })
    }
    return leaderboardArray
  }

  function getPositionArray(leaderboard: Leaderboard) {
    return leaderboard.reduce((acc, entry) => {
      if (acc.includes(entry.points)) {
        return acc
      }
      acc.push(entry.points)
      return acc
    }, [] as number[])
  }
}
