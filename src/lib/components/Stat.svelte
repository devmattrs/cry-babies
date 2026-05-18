<script lang="ts">
	type Props = {
		label: string;
		value: string | number;
		hint?: string;
		trend?: { direction: 'up' | 'down' | 'flat'; value: string };
	};
	let { label, value, hint, trend }: Props = $props();
</script>

<div class="glass flex flex-col gap-2 p-5">
	<p class="label-text">{label}</p>
	<div class="flex items-baseline gap-2">
		<p class="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
		{#if trend}
			<span class="muted text-xs tabular-nums">
				{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '·'}
				{trend.value}
			</span>
		{/if}
	</div>
	{#if hint}
		<p class="muted text-xs">{hint}</p>
	{/if}
</div>
