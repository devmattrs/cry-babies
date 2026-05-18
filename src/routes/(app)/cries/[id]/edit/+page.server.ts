import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { cryEvents } from '$lib/server/db/schema';
import { parseCryForm } from '$lib/server/cry-form';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.profile) throw redirect(303, '/profiles');
	const [cry] = await db
		.select()
		.from(cryEvents)
		.where(and(eq(cryEvents.id, params.id), eq(cryEvents.profileId, locals.profile.id)))
		.limit(1);
	if (!cry) throw error(404, 'Cry not found');
	return {
		profile: { id: locals.profile.id, name: locals.profile.name },
		cry
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.profile) throw redirect(303, '/profiles');
		const formData = await request.formData();
		const parsed = parseCryForm(formData);
		if (!parsed.ok) return fail(400, { error: parsed.error });
		const result = await db
			.update(cryEvents)
			.set(parsed.data)
			.where(and(eq(cryEvents.id, params.id), eq(cryEvents.profileId, locals.profile.id)))
			.returning({ id: cryEvents.id });
		if (result.length === 0) throw error(404, 'Cry not found');
		throw redirect(303, '/cries');
	}
};
