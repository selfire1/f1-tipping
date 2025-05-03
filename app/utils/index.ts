import type { LocationQuery } from 'vue-router'
import type { ToastProps } from '@nuxt/ui'
import type { Database } from '~~/types/db'
export function $getConstructorCssVariable(teamId: string) {
  return `var(--clr-team-${teamId})`
}

export function $getQueryOrigin(origin: QueryOrigin | null): LocationQuery {
  return { origin: origin ?? '' }
}

export function $getSuccessToast(
  info: Partial<ToastProps>,
): Partial<ToastProps> {
  return {
    title: 'Success',
    color: 'success',
    duration: 3000,
    icon: 'carbon:checkmark-outline',
    ...info,
  }
}

export function $getErrorToast(info: Partial<ToastProps>): Partial<ToastProps> {
  return {
    title: 'Something went wrong',
    color: 'error',
    duration: 3000,
    icon: 'carbon:error',
    ...info,
  }
}

export const $localeDateTimeOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

export const $getCachedFetchConfig = (message?: string) => {
  const nuxtApp = useNuxtApp()
  return {
    getCachedData: (key: string) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      console.log(message, 'is in cache:', !!inCache)
      return inCache
    },
  }
}

export function $getUserImgSrc(user: Pick<Database.User, 'id'>) {
  return `/img/user/${user.id}.png`
}
