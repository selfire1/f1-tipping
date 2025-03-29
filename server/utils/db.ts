import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'
import * as authSchema from '../db/auth-schema'

export function useDb() {
  return drizzle({
    connection: {
      url: process.env.NUXT_TURSO_DATABASE_URL || '',
      authToken: process.env.NUXT_TURSO_AUTH_TOKEN || '',
    },
    casing: 'snake_case',
    schema: {
      ...schema,
      ...authSchema,
    },
  })
}
