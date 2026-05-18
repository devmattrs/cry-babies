<script lang="ts">
	import { intensityLabel } from '$lib/cries';
	type Props = { value: number; size?: 'sm' | 'md'; showLabel?: boolean };
	let { value, size = 'md', showLabel = true }: Props = $props();
	const segments = $derived(Array.from({ length: 10 }, (_, i) => i < value));
</script>

<div class="flex items-center gap-2">
	<div class="track flex flex-1 gap-[2px]" style="height: {size === 'sm' ? '6px' : '8px'}">
		{#each segments as filled, i}
			<div
				class="seg flex-1 rounded-sm"
				class:filled
				style={filled
					? `background: oklch(0.32 0.005 270 / ${0.55 + (i / 10) * 0.45})`
					: undefined}
			></div>
		{/each}
	</div>
	{#if showLabel}
		<span class="text-xs font-medium tabular-nums" style="min-width: 4.5rem">
			{value}/10 · {intensityLabel(value)}
		</span>
	{/if}
</div>

<style>
	.seg:not(.filled) {
		background: oklch(0 0 0 / 0.07);
	}
	@media (prefers-color-scheme: dark) {
		.seg:not(.filled) {
			background: oklch(1 0 0 / 0.08);
		}
	}
</style>
