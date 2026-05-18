<script lang="ts">
	type Bar = { label: string; sublabel?: string; value: number; tooltip?: string };
	type Props = {
		bars: Bar[];
		orientation?: 'vertical' | 'horizontal';
		emptyLabel?: string;
		max?: number;
	};
	let { bars, orientation = 'vertical', emptyLabel = 'No data yet', max }: Props = $props();
	const computedMax = $derived(Math.max(1, max ?? 0, ...bars.map((b) => b.value)));
</script>

{#if bars.length === 0 || bars.every((b) => b.value === 0)}
	<div class="muted flex h-32 items-center justify-center text-sm">{emptyLabel}</div>
{:else if orientation === 'vertical'}
	<div class="flex h-40 items-end gap-1.5">
		{#each bars as bar}
			{@const pct = (bar.value / computedMax) * 100}
			<div class="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
				<div
					class="w-full rounded-md transition-all"
					style="height: {Math.max(2, pct)}%; background: oklch(0.4 0.01 270 / {0.25 + (bar.value / computedMax) * 0.45}); min-height: 2px;"
					title={bar.tooltip ?? `${bar.label}: ${bar.value}`}
				></div>
				<div class="text-center">
					<p class="muted text-[10px] leading-tight">{bar.label}</p>
					{#if bar.sublabel}
						<p class="text-[10px] font-medium leading-tight tabular-nums">{bar.sublabel}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each bars as bar}
			{@const pct = (bar.value / computedMax) * 100}
			<div class="flex items-center gap-3">
				<div class="w-28 shrink-0 truncate text-sm">{bar.label}</div>
				<div
					class="relative h-6 flex-1 overflow-hidden rounded-md"
					style="background: oklch(0 0 0 / 0.05)"
				>
					<div
						class="absolute inset-y-0 left-0 rounded-md transition-all"
						style="width: {Math.max(2, pct)}%; background: oklch(0.32 0.005 270 / 0.85)"
					></div>
					<div
						class="absolute inset-y-0 right-2 flex items-center text-xs font-medium tabular-nums"
						style="color: oklch(0.2 0.005 270)"
					>
						{bar.value}{bar.sublabel ? ` · ${bar.sublabel}` : ''}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
