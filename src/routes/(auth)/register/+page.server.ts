import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createSession, hashPassword, setSessionCookie } from '$lib/server/auth';
import type { Actions } from './$types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');

		if (!EMAIL_RE.test(email)) {
			return fail(400, { email, error: 'Please enter a valid email.' });
		}
		if (password.length < 8) {
			return fail(400, { email, error: 'Password must be at least 8 characters.' });
		}

		const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (existing) {
			return fail(400, { email, error: 'An account with that email already exists.' });
		}

		const passwordHash = await hashPassword(password);
		const [user] = await db.insert(users).values({ email, passwordHash }).returning();

		const { token, expiresAt } = await createSession(user.id);
		setSessionCookie(event, token, expiresAt);

		throw redirect(303, '/profiles');
	}
};
