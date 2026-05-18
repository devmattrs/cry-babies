<script lang="ts">
	import Stat from '$lib/components/Stat.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import CryListItem from '$lib/components/CryListItem.svelte';
	import { formatDuration, reasonLabel, relativeTime } from '$lib/cries';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const initials = $derived(
		data.profile.name
			.split(/\s+/)
			.map((s) => s[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	const trend = $derived.by(() => {
		const cur = data.stats.thisWeek;
		const prev = data.stats.prevWeek;
		if (prev === 0 && cur === 0) return undefined;
		if (prev === 0) return { direction: 'up' as const, value: 'new' };
		const pct = Math.round(((cur - prev) / prev) * 100);
		if (pct === 0) return { direction: 'flat' as const, value: '0%' };
		return { direction: (pct > 0 ? 'up' : 'down') as 'up' | 'down', value: `${Math.abs(pct)}%` };
	});

	const dailyBars = $derived(
		data.stats.daily.map((d) => {
			const date = new Date(d.day);
			const label = date.toLocaleDateString(undefined, { weekday: 'narrow' });
			return {
				label,
				sublabel: d.count > 0 ? String(d.count) : '',
				value: d.count,
				tooltip: `${date.toLocaleDateString()}: ${d.count} cries`
			};
		})
	);

	const reasonBars = $derived(
		data.stats.reasons.map((r) => ({
			label: reasonLabel(r.reason),
			value: r.count,
			sublabel: `avg ${r.avgIntensity.toFixed(1)}`
		}))
	);

	const hourlyBars = $derived(
		data.stats.hourly.map((h) => ({
			label: h.hour % 6 === 0 ? `${h.hour}` : '',
			value: h.count,
			tooltip: `${h.hour}:00 — ${h.count} cries`
		}))
	);

	const totalDuration = $derived(formatDuration(data.stats.totals.totalDuration ?? 0));
	const lastCryRel = $derived(
		data.stats.totals.lastAt ? relativeTime(data.stats.totals.lastAt) : 'no cries yet'
	);
	const avgToday = $derived(
		data.stats.today.count > 0 ? data.stats.today.avgIntensity.toFixed(1) : '—'
	);
</script>

<div class="flex flex-col gap-8">
	<section class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<span
				class="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-semibold"
				style="background: oklch(0.22 0.005 270); color: oklch(0.98 0.005 270)"
			>
				{initials}
			</span>
			<div>
				<p class="muted text-xs uppercase tracking-wider">Active profile</p>
				<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">{data.profile.name}</h1>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<a href="/cries" class="btn-glass">View log</a>
			<a href="/cries/new" class="btn-primary">Log a cry</a>
		</div>
	</section>

	<section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<Stat
			label="Today"
			value={data.stats.today.count}
			hint={data.stats.today.count > 0
				? `${formatDuration(data.stats.today.totalDuration ?? 0)} total · avg ${avgToday}`
				: 'no cries yet'}
		/>
		<Stat
			label="This week"
			value={data.stats.thisWeek}
			trend={trend ? { direction: trend.direction, value: trend.value } : undefined}
			hint="vs previous 7 days"
		/>
		<Stat
			label="All time"
			value={data.stats.totals.total}
			hint={data.stats.totals.total > 0
				? `${totalDuration} total time logged`
				: 'start logging to see trends'}
		/>
		<Stat
			label="Last cry"
			value={lastCryRel}
			hint={data.stats.totals.total > 0
				? `avg intensity ${data.stats.totals.avgIntensity.toFixed(1)}/10`
				: '—'}
		/>
	</section>

	<section class="grid grid-cols-1 gap-3 lg:grid-cols-5">
		<div class="glass flex flex-col gap-4 p-5 lg:col-span-3">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-base font-semibold">Last 14 days</h2>
					<p class="muted text-xs">Daily cry count</p>
				</div>
				<span class="muted text-xs tabular-nums">
					{data.stats.daily.reduce((a, b) => a + b.count, 0)} total
				</span>
			</div>
			<BarChart bars={dailyBars} orientation="vertical" emptyLabel="No cries in the last 14 days" />
		</div>
		<div class="glass flex flex-col gap-4 p-5 lg:col-span-2">
			<div>
				<h2 class="text-base font-semibold">Top reasons</h2>
				<p class="muted text-xs">All-time breakdown</p>
			</div>
			<BarChart bars={reasonBars} orientation="horizontal" emptyLabel="No reasons tracked yet" />
		</div>
	</section>

	<section class="glass flex flex-col gap-4 p-5">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-base font-semibold">Time of day</h2>
				<p class="muted text-xs">When cries happen (last 30 days)</p>
			</div>
			<span class="muted text-xs tabular-nums">
				{data.stats.hourly.reduce((a, b) => a + b.count, 0)} cries
			</span>
		</div>
		<BarChart bars={hourlyBars} orientation="vertical" emptyLabel="No cries in the last 30 days" />
		<div class="muted flex justify-between text-[10px] tabular-nums">
			<span>00</span>
			<span>06</span>
			<span>12</span>
			<span>18</span>
			<span>23</span>
		</div>
	</section>

	<section class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<h2 class="text-base font-semibold">Recent cries</h2>
			<a href="/cries" class="btn-ghost">See all</a>
		</div>
		{#if data.recent.length === 0}
			<div class="glass p-8 text-center">
				<p class="muted">Nothing logged yet for {data.profile.name}.</p>
				<a href="/cries/new" class="btn-primary mt-4 inline-flex">Log the first cry</a>
			</div>
		{:else}
			<div class="flex flex-col gap-2">
				{#each data.recent as cry (cry.id)}
					<CryListItem {cry} />
				{/each}
			</div>
		{/if}
	</section>
</div>
