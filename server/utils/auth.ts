import { betterAuth } from "better-auth";
// import { LibsqlDialect } from "@libsql/kysely-libsql";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

// const dialect = new LibsqlDialect({
//   url: process.env.NUXT_TURSO_DATABASE_URL || "",
//   authToken: process.env.NUXT_TURSO_AUTH_TOKEN || "",
// });

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  // database: {
  //   dialect,
  //   type: "sqlite",
  // },
});
