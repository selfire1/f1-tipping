import type { Database } from "./db";

export type DriverOption = Pick<
  Database.Driver,
  "constructorId" | "givenName" | "familyName" | "id"
>;
