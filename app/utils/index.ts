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
