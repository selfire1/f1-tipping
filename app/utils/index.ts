import type { LocationQuery } from "vue-router";
import type { Notification } from "#ui/types";
export function $getConstructorCssVariable(teamId: string) {
  return `var(--clr-team-${teamId})`;
}

export function $getQueryOrigin(origin: QueryOrigin | null): LocationQuery {
  return { origin: origin ?? "" };
}

export function $getSuccessToast(
  info: Partial<Notification>,
): Partial<Notification> {
  return {
    title: "Success",
    color: "green",
    timeout: 3000,
    icon: "carbon:checkmark-outline",
    ...info,
  };
}

export function $getErrorToast(
  info: Partial<Notification>,
): Partial<Notification> {
  return {
    title: "Something went wrong",
    color: "red",
    timeout: 3000,
    icon: "carbon:error",
    ...info,
  };
}

export const $localeDateTimeOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export const $getCachedFetchConfig = (message?: string) => {
  const nuxtApp = useNuxtApp();
  return {
    getCachedData: (key: string) => {
      const inCache = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      console.log(message, "is in cache:", !!inCache);
      return inCache;
    },
  };
};
