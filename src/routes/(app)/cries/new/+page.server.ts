import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { cryEvents } from '$lib/server/db/schema';
import { parseCryForm } from '$lib/server/cry-form';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.profile) throw redirect(303, '/profiles');
	return { profile: { id: locals.profile.id, name: locals.profile.name } };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.profile) throw redirect(303, '/profiles');
		const formData = await request.formData();
		const parsed = parseCryForm(formData);
		if (!parsed.ok) return fail(400, { error: parsed.error });
		await db.insert(cryEvents).values({ profileId: locals.profile.id, ...parsed.data });
		throw redirect(303, '/dashboard');
	}
};
