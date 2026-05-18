<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTime, formatDuration, reasonLabel, relativeTime } from '$lib/cries';
	import IntensityMeter from './IntensityMeter.svelte';
	import type { CryEvent } from '$lib/server/db/schema';

	type Props = { cry: CryEvent; showActions?: boolean };
	let { cry, showActions = false }: Props = $props();
</script>

<div class="glass-tight p-4">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-medium">{reasonLabel(cry.reason)}</span>
				{#if cry.location}
					<span class="muted text-xs">· {cry.location}</span>
				{/if}
				{#if cry.hadTears}
					<span class="chip !py-0.5 !text-[10px]">tears</span>
				{/if}
				{#if !cry.wasSoothed}
					<span class="chip !py-0.5 !text-[10px]">unsoothed</span>
				{/if}
			</div>
			<p class="muted mt-0.5 text-xs">
				{formatDateTime(cry.occurredAt)} · {relativeTime(cry.occurredAt)}
				{#if cry.durationSeconds != null}
					· {formatDuration(cry.durationSeconds)}
				{/if}
			</p>
		</div>
		{#if showActions}
			<div class="flex shrink-0 items-center gap-1">
				<a href="/cries/{cry.id}/edit" class="btn-ghost">Edit</a>
				<form
					method="POST"
					action="/cries?/delete"
					use:enhance={() => ({ update }) => update({ reset: false })}
				>
					<input type="hidden" name="id" value={cry.id} />
					<button
						class="btn-ghost"
						type="submit"
						onclick={(e) => {
							if (!confirm('Delete this cry?')) e.preventDefault();
						}}>Delete</button
					>
				</form>
			</div>
		{/if}
	</div>

	<div class="mt-3">
		<IntensityMeter value={cry.intensity} size="sm" />
	</div>

	{#if cry.trigger || cry.soothedBy || cry.notes}
		<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#if cry.trigger}
				<div>
					<p class="label-text">Trigger</p>
					<p class="text-sm">{cry.trigger}</p>
				</div>
			{/if}
			{#if cry.soothedBy}
				<div>
					<p class="label-text">Soothed by</p>
					<p class="text-sm">{cry.soothedBy}</p>
				</div>
			{/if}
		</div>
		{#if cry.notes}
			<div class="mt-2">
				<p class="label-text">Notes</p>
				<p class="text-sm whitespace-pre-wrap">{cry.notes}</p>
			</div>
		{/if}
	{/if}
</div>
