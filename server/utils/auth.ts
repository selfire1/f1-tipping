import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { hoursToSeconds } from 'date-fns'
import { useDb } from './db'

export function useAuth() {
  return betterAuth({
    session: {
      cookieCache: {
        enabled: true,
        maxAge: hoursToSeconds(24 * 14), // 14 days
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    database: drizzleAdapter(useDb(), {
      provider: 'sqlite',
    }),
  })
}
