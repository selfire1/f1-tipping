import type { LocationQuery } from "vue-router";
export function $getConstructorCssVariable(teamId: string) {
  return `var(--clr-team-${teamId})`;
}

export function $getQueryOrigin(origin: QueryOrigin | null): LocationQuery {
  return { origin: origin ?? "" };
}
