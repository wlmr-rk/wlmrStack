import type { Handle } from "@sveltejs/kit";
import { getSessionCookieName, isValidSessionCookie } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get(getSessionCookieName());
  event.locals.authenticated = isValidSessionCookie(session);

  return resolve(event);
};
