import { and, count, desc, eq, gte, sql, sum } from 'drizzle-orm';
import { db } from './db';
import { cryEvents } from './db/schema';

export type CryStats = Awaited<ReturnType<typeof getProfileStats>>;

export async function getProfileStats(profileId: string) {
	const now = new Date();
	const startOfDay = new Date(now);
	startOfDay.setHours(0, 0, 0, 0);
	const since7d = new Date(now);
	since7d.setDate(now.getDate() - 7);
	const since14d = new Date(now);
	since14d.setDate(now.getDate() - 13);
	since14d.setHours(0, 0, 0, 0);
	const since30d = new Date(now);
	since30d.setDate(now.getDate() - 30);
	const sincePrev7d = new Date(now);
	sincePrev7d.setDate(now.getDate() - 14);

	const where = eq(cryEvents.profileId, profileId);

	const [totals] = await db
		.select({
			total: count(),
			totalDuration: sum(cryEvents.durationSeconds).mapWith(Number),
			avgIntensity: sql<number>`coalesce(avg(${cryEvents.intensity}), 0)`.mapWith(Number),
			maxIntensity: sql<number>`coalesce(max(${cryEvents.intensity}), 0)`.mapWith(Number),
			lastAt: sql<Date | null>`max(${cryEvents.occurredAt})`,
			firstAt: sql<Date | null>`min(${cryEvents.occurredAt})`,
			tearCount: sql<number>`coalesce(sum(case when ${cryEvents.hadTears} then 1 else 0 end), 0)`.mapWith(
				Number
			),
			soothedCount: sql<number>`coalesce(sum(case when ${cryEvents.wasSoothed} then 1 else 0 end), 0)`.mapWith(
				Number
			)
		})
		.from(cryEvents)
		.where(where);

	const [today] = await db
		.select({
			count: count(),
			avgIntensity: sql<number>`coalesce(avg(${cryEvents.intensity}), 0)`.mapWith(Number),
			totalDuration: sql<number>`coalesce(sum(${cryEvents.durationSeconds}), 0)`.mapWith(Number)
		})
		.from(cryEvents)
		.where(and(where, gte(cryEvents.occurredAt, startOfDay)));

	const [thisWeek] = await db
		.select({ count: count() })
		.from(cryEvents)
		.where(and(where, gte(cryEvents.occurredAt, since7d)));

	const [prevWeek] = await db
		.select({ count: count() })
		.from(cryEvents)
		.where(
			and(
				where,
				gte(cryEvents.occurredAt, sincePrev7d),
				sql`${cryEvents.occurredAt} < ${since7d}`
			)
		);

	const daily = await db
		.select({
			day: sql<string>`to_char(date_trunc('day', ${cryEvents.occurredAt}), 'YYYY-MM-DD')`,
			count: count(),
			avgIntensity: sql<number>`coalesce(avg(${cryEvents.intensity}), 0)`.mapWith(Number)
		})
		.from(cryEvents)
		.where(and(where, gte(cryEvents.occurredAt, since14d)))
		.groupBy(sql`date_trunc('day', ${cryEvents.occurredAt})`)
		.orderBy(sql`date_trunc('day', ${cryEvents.occurredAt}) asc`);

	const reasons = await db
		.select({
			reason: cryEvents.reason,
			count: count(),
			avgIntensity: sql<number>`coalesce(avg(${cryEvents.intensity}), 0)`.mapWith(Number)
		})
		.from(cryEvents)
		.where(where)
		.groupBy(cryEvents.reason)
		.orderBy(desc(count()))
		.limit(8);

	const hourly = await db
		.select({
			hour: sql<number>`extract(hour from ${cryEvents.occurredAt})::int`,
			count: count()
		})
		.from(cryEvents)
		.where(and(where, gte(cryEvents.occurredAt, since30d)))
		.groupBy(sql`extract(hour from ${cryEvents.occurredAt})`);

	return { totals, today, thisWeek, prevWeek, daily, reasons, hourly };
}

export async function listCries(profileId: string, limit?: number) {
	const q = db
		.select()
		.from(cryEvents)
		.where(eq(cryEvents.profileId, profileId))
		.orderBy(desc(cryEvents.occurredAt));
	if (limit) return q.limit(limit);
	return q;
}

export function fillDailySeries(
	rows: { day: string; count: number; avgIntensity: number }[],
	days: number
): { day: string; date: Date; count: number; avgIntensity: number }[] {
	const byDay = new Map(rows.map((r) => [r.day, r]));
	const out: { day: string; date: Date; count: number; avgIntensity: number }[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		const row = byDay.get(key);
		out.push({ day: key, date: d, count: row?.count ?? 0, avgIntensity: row?.avgIntensity ?? 0 });
	}
	return out;
}

export function fillHourlySeries(rows: { hour: number; count: number }[]) {
	const byHour = new Map(rows.map((r) => [r.hour, r.count]));
	return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: byHour.get(h) ?? 0 }));
}
