import type { Database } from "./db";

export type DriverOption = Pick<
  Database.Driver,
  "constructorId" | "givenName" | "familyName" | "id"
>;

export type ConstructorOption = Pick<Database.Constructor, "id" | "name">;
