<script lang="ts">
	import CryListItem from '$lib/components/CryListItem.svelte';
	import { CRY_REASONS, reasonLabel } from '$lib/cries';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let reasonFilter = $state<string>('all');
	let intensityFilter = $state<'all' | 'low' | 'mid' | 'high'>('all');

	const allReasons = $derived(
		Array.from(new Set(data.cries.map((c) => c.reason)))
	);

	const filtered = $derived(
		data.cries.filter((c) => {
			if (reasonFilter !== 'all' && c.reason !== reasonFilter) return false;
			if (intensityFilter === 'low' && c.intensity > 3) return false;
			if (intensityFilter === 'mid' && (c.intensity < 4 || c.intensity > 7)) return false;
			if (intensityFilter === 'high' && c.intensity < 8) return false;
			if (search.trim()) {
				const q = search.toLowerCase();
				const hay = [c.reason, c.trigger, c.soothedBy, c.location, c.notes]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		})
	);
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Cry log</h1>
			<p class="muted mt-1 text-sm">
				{data.cries.length} entries for {data.profile.name}
			</p>
		</div>
		<a href="/cries/new" class="btn-primary">Log a cry</a>
	</header>

	<section class="glass flex flex-col gap-3 p-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<input
				class="input-glass flex-1"
				placeholder="Search trigger, soothed by, notes…"
				bind:value={search}
			/>
			<select class="input-glass sm:max-w-[12rem]" bind:value={reasonFilter}>
				<option value="all">All reasons</option>
				{#each CRY_REASONS as r}
					{#if allReasons.includes(r.value)}
						<option value={r.value}>{r.label}</option>
					{/if}
				{/each}
				{#each allReasons.filter((r) => !CRY_REASONS.some((cr) => cr.value === r)) as r}
					<option value={r}>{reasonLabel(r)}</option>
				{/each}
			</select>
		</div>
		<div class="flex flex-wrap gap-1.5">
			<button class="chip" data-selected={intensityFilter === 'all'} onclick={() => (intensityFilter = 'all')}>All intensities</button>
			<button class="chip" data-selected={intensityFilter === 'low'} onclick={() => (intensityFilter = 'low')}>Low (1–3)</button>
			<button class="chip" data-selected={intensityFilter === 'mid'} onclick={() => (intensityFilter = 'mid')}>Mid (4–7)</button>
			<button class="chip" data-selected={intensityFilter === 'high'} onclick={() => (intensityFilter = 'high')}>High (8–10)</button>
		</div>
	</section>

	{#if filtered.length === 0}
		<div class="glass p-10 text-center">
			{#if data.cries.length === 0}
				<p class="muted">No cries logged yet.</p>
				<a href="/cries/new" class="btn-primary mt-4 inline-flex">Log the first one</a>
			{:else}
				<p class="muted">No cries match those filters.</p>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each filtered as cry (cry.id)}
				<CryListItem {cry} showActions />
			{/each}
		</div>
	{/if}
</div>
