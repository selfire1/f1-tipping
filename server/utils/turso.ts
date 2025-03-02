import { createClient } from "@libsql/client";
import { H3Event } from "h3";

export function useTurso(event: H3Event) {
  const { turso } = useRuntimeConfig(event);

  return createClient({
    url: turso.databaseUrl,
    authToken: turso.authToken,
  });
}
