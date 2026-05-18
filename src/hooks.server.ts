import type { Handle } from '@sveltejs/kit';
import { readSessionCookie, validateSessionToken, clearSessionCookie } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = readSessionCookie(event);
	if (!token) {
		event.locals.user = null;
		event.locals.profile = null;
		event.locals.sessionId = null;
		return resolve(event);
	}
	const { session, user, profile } = await validateSessionToken(token);
	if (!session) {
		clearSessionCookie(event);
		event.locals.user = null;
		event.locals.profile = null;
		event.locals.sessionId = null;
	} else {
		event.locals.user = user;
		event.locals.profile = profile;
		event.locals.sessionId = session.id;
	}
	return resolve(event);
};
