import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { cryEvents } from '$lib/server/db/schema';
import { listCries } from '$lib/server/cry-queries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.profile) throw redirect(303, '/profiles');
	const cries = await listCries(locals.profile.id);
	return {
		profile: { id: locals.profile.id, name: locals.profile.name },
		cries
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.profile) return fail(400, { error: 'No active profile.' });
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id.' });
		await db
			.delete(cryEvents)
			.where(and(eq(cryEvents.id, id), eq(cryEvents.profileId, locals.profile.id)));
		return { ok: true };
	}
};
