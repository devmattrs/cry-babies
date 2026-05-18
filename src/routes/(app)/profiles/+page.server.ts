import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { setActiveProfile } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const AVATAR_COLORS = [
	'preset-filled-primary-500',
	'preset-filled-secondary-500',
	'preset-filled-tertiary-500',
	'preset-filled-success-500',
	'preset-filled-warning-500',
	'preset-filled-error-500'
];

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, locals.user!.id))
		.orderBy(profiles.createdAt);
	return {
		profiles: rows,
		activeProfileId: locals.profile?.id ?? null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required.' });
		if (name.length > 50) return fail(400, { error: 'Name must be 50 characters or fewer.' });

		const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
		await db.insert(profiles).values({ userId: locals.user!.id, name, avatarColor });
		return { ok: true };
	},

	switch: async ({ request, locals }) => {
		const data = await request.formData();
		const profileId = String(data.get('profileId') ?? '');
		const [match] = await db
			.select()
			.from(profiles)
			.where(and(eq(profiles.id, profileId), eq(profiles.userId, locals.user!.id)))
			.limit(1);
		if (!match) return fail(404, { error: 'Profile not found.' });
		await setActiveProfile(locals.sessionId!, match.id);
		throw redirect(303, '/dashboard');
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const profileId = String(data.get('profileId') ?? '');
		await db
			.delete(profiles)
			.where(and(eq(profiles.id, profileId), eq(profiles.userId, locals.user!.id)));
		if (locals.profile?.id === profileId) {
			await setActiveProfile(locals.sessionId!, null);
		}
		return { ok: true };
	}
};
