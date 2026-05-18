import { redirect } from '@sveltejs/kit';
import { fillDailySeries, fillHourlySeries, getProfileStats, listCries } from '$lib/server/cry-queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.profile) throw redirect(303, '/profiles');
	const stats = await getProfileStats(locals.profile.id);
	const recent = await listCries(locals.profile.id, 6);
	return {
		profile: {
			id: locals.profile.id,
			name: locals.profile.name,
			avatarColor: locals.profile.avatarColor,
			createdAt: locals.profile.createdAt
		},
		stats: {
			totals: stats.totals,
			today: stats.today,
			thisWeek: stats.thisWeek.count,
			prevWeek: stats.prevWeek.count,
			daily: fillDailySeries(stats.daily, 14),
			reasons: stats.reasons,
			hourly: fillHourlySeries(stats.hourly)
		},
		recent
	};
};
