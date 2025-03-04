import type { EventHandler, EventHandlerRequest } from "h3";
type AuthSession = typeof auth.$Infer.Session;

declare module "h3" {
  interface H3EventContext {
    /**
     * Only available on `defineAuthedEventHandler`
     */
    auth: AuthSession;
  }
}

export const defineAuthedEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session?.user) {
      throw createError({ statusMessage: "Unauthorized", statusCode: 401 });
    }
    event.context.auth = session;
    const response = await handler(event);
    return response;
  });
