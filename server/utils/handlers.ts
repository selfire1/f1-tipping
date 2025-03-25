import type { EventHandler, EventHandlerRequest } from 'h3'
import bcrypt from 'bcryptjs'
type AuthSession = typeof auth.$Infer.Session

declare module 'h3' {
  interface H3EventContext {
    /**
     * Only available on `defineAuthedEventHandler`
     */
    auth: AuthSession
  }
}

export const defineAuthedEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const session = await auth.api.getSession({
      headers: event.headers,
    })

    if (!session?.user) {
      throw createError({ statusMessage: 'Unauthorized', statusCode: 401 })
    }
    event.context.auth = session
    const response = await handler(event)
    return response
  })

export const defineBasicAuthedEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      setResponseHeader(
        event,
        'WWW-Authenticate',
        'Basic realm="Protected Area"',
      )
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const credentials = Buffer.from(
      authHeader.split(' ')[1],
      'base64',
    ).toString()
    const [providedUsername, providedPassword] = credentials.split(':')

    const storedHashedPassword = process.env.UPDATES_PASSWORD_HASH as string
    const storedUser = process.env.UPDATES_USER as string

    const isPasswordValid = await bcrypt.compare(
      providedPassword,
      storedHashedPassword,
    )
    const isUserValid = providedUsername === storedUser
    if (!isPasswordValid || !isUserValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      })
    }

    return await handler(event)
  })
