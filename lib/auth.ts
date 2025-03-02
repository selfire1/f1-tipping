import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const dialect = new LibsqlDialect({
  url: process.env.NUXT_TURSO_DATABASE_URL || "",
  authToken: process.env.NUXT_TURSO_AUTH_TOKEN || "",
});

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: {
    dialect,
    type: "sqlite",
  },
});
