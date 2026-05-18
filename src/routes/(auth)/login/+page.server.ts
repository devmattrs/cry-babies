import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createSession, setSessionCookie, verifyPassword } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { email, error: 'Email and password are required.' });
		}

		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (!user || !(await verifyPassword(user.passwordHash, password))) {
			return fail(400, { email, error: 'Invalid email or password.' });
		}

		const { token, expiresAt } = await createSession(user.id);
		setSessionCookie(event, token, expiresAt);

		throw redirect(303, '/profiles');
	}
};
