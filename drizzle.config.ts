import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: ["./server/db/schema.ts", "./server/db/auth-schema.ts"],
  out: "./migrations",
  dialect: "turso",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.NUXT_TURSO_DATABASE_URL!,
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN!,
  },
});
