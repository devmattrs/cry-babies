import { redirect } from '@sveltejs/kit';
import { clearSessionCookie, invalidateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(303, '/');
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.sessionId) {
			await invalidateSession(event.locals.sessionId);
		}
		clearSessionCookie(event);
		throw redirect(303, '/login');
	}
};
