<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { CRY_REASONS, intensityLabel, toDateTimeLocal } from '$lib/cries';
	import IntensityMeter from './IntensityMeter.svelte';

	type Initial = {
		occurredAt?: Date | string;
		durationMinutes?: number | null;
		intensity?: number;
		reason?: string;
		trigger?: string | null;
		soothedBy?: string | null;
		location?: string | null;
		hadTears?: boolean;
		wasSoothed?: boolean;
		notes?: string | null;
	};
	type Props = {
		initial?: Initial;
		formError?: string;
		submitLabel?: string;
		cancelHref?: string;
	};
	let {
		initial = {},
		formError,
		submitLabel = 'Log cry',
		cancelHref = '/dashboard'
	}: Props = $props();

	const knownReasonValues = CRY_REASONS.map((r) => r.value) as readonly string[];
	const seed = untrack(() => {
		const reasonRaw = initial.reason ?? 'unknown';
		const isKnown = knownReasonValues.includes(reasonRaw);
		return {
			intensity: initial.intensity ?? 5,
			reason: isKnown ? reasonRaw : 'other',
			customReason: isKnown ? '' : reasonRaw,
			hadTears: initial.hadTears ?? false,
			wasSoothed: initial.wasSoothed ?? true,
			occurredAt: initial.occurredAt
				? toDateTimeLocal(initial.occurredAt)
				: toDateTimeLocal(new Date()),
			trigger: initial.trigger ?? '',
			soothedBy: initial.soothedBy ?? '',
			location: initial.location ?? '',
			notes: initial.notes ?? '',
			durationMinutes: initial.durationMinutes ?? ''
		};
	});

	let intensity = $state(seed.intensity);
	let reason = $state(seed.reason);
	let customReason = $state(seed.customReason);
	let hadTears = $state(seed.hadTears);
	let wasSoothed = $state(seed.wasSoothed);
	let submitting = $state(false);
</script>

<form
	method="POST"
	class="flex flex-col gap-5"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	<section class="glass flex flex-col gap-5 p-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<label class="flex flex-col gap-1.5">
				<span class="label-text">When</span>
				<input
					class="input-glass"
					type="datetime-local"
					name="occurredAt"
					value={seed.occurredAt}
					required
				/>
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="label-text">Duration (minutes)</span>
				<input
					class="input-glass"
					type="number"
					name="durationMinutes"
					min="0"
					step="0.5"
					placeholder="optional"
					value={seed.durationMinutes}
				/>
			</label>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="label-text">Intensity</span>
				<span class="text-xs font-medium tabular-nums">
					{intensity}/10 · {intensityLabel(intensity)}
				</span>
			</div>
			<input
				type="range"
				name="intensity"
				min="1"
				max="10"
				step="1"
				bind:value={intensity}
				class="range w-full"
			/>
			<IntensityMeter value={intensity} showLabel={false} />
		</div>
	</section>

	<section class="glass flex flex-col gap-4 p-6">
		<div>
			<span class="label-text">Reason</span>
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each CRY_REASONS as r}
					<button
						type="button"
						class="chip"
						data-selected={reason === r.value}
						onclick={() => (reason = r.value)}
					>
						{r.label}
					</button>
				{/each}
				<button
					type="button"
					class="chip"
					data-selected={reason === 'other'}
					onclick={() => (reason = 'other')}
				>
					Other…
				</button>
			</div>
			<input type="hidden" name="reason" value={reason} />
			{#if reason === 'other'}
				<input
					class="input-glass mt-3"
					name="customReason"
					maxlength="40"
					placeholder="Describe the reason"
					bind:value={customReason}
					required
				/>
			{/if}
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<label class="flex flex-col gap-1.5">
				<span class="label-text">Trigger</span>
				<input
					class="input-glass"
					name="trigger"
					maxlength="120"
					placeholder="What set it off?"
					value={seed.trigger}
				/>
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="label-text">Soothed by</span>
				<input
					class="input-glass"
					name="soothedBy"
					maxlength="120"
					placeholder="What helped?"
					value={seed.soothedBy}
				/>
			</label>
		</div>

		<label class="flex flex-col gap-1.5">
			<span class="label-text">Location</span>
			<input
				class="input-glass"
				name="location"
				maxlength="60"
				placeholder="Home, car, grandma's…"
				value={seed.location}
			/>
		</label>

		<div class="flex flex-wrap gap-2">
			<label class="chip cursor-pointer" data-selected={hadTears}>
				<input
					type="checkbox"
					name="hadTears"
					class="sr-only"
					bind:checked={hadTears}
				/>
				Tears
			</label>
			<label class="chip cursor-pointer" data-selected={wasSoothed}>
				<input
					type="checkbox"
					name="wasSoothed"
					class="sr-only"
					bind:checked={wasSoothed}
				/>
				Was soothed
			</label>
		</div>

		<label class="flex flex-col gap-1.5">
			<span class="label-text">Notes</span>
			<textarea
				class="input-glass"
				name="notes"
				maxlength="2000"
				rows="3"
				placeholder="Anything else worth remembering?">{seed.notes}</textarea>
		</label>
	</section>

	{#if formError}
		<p class="text-sm" style="color: oklch(0.55 0.18 25)">{formError}</p>
	{/if}

	<div class="flex items-center justify-end gap-2">
		<a href={cancelHref} class="btn-ghost">Cancel</a>
		<button class="btn-primary" type="submit" disabled={submitting}>
			{submitting ? 'Saving…' : submitLabel}
		</button>
	</div>
</form>

<style>
	.range {
		appearance: none;
		-webkit-appearance: none;
		height: 4px;
		background: oklch(0 0 0 / 0.08);
		border-radius: 999px;
		outline: none;
	}
	.range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 999px;
		background: oklch(0.22 0.005 270);
		border: 2px solid oklch(0.98 0.005 270);
		box-shadow: 0 2px 6px oklch(0 0 0 / 0.18);
		cursor: pointer;
	}
	.range::-moz-range-thumb {
		width: 22px;
		height: 22px;
		border-radius: 999px;
		background: oklch(0.22 0.005 270);
		border: 2px solid oklch(0.98 0.005 270);
		box-shadow: 0 2px 6px oklch(0 0 0 / 0.18);
		cursor: pointer;
	}
	@media (prefers-color-scheme: dark) {
		.range {
			background: oklch(1 0 0 / 0.1);
		}
		.range::-webkit-slider-thumb {
			background: oklch(0.96 0.005 270);
			border-color: oklch(0.18 0.005 270);
		}
		.range::-moz-range-thumb {
			background: oklch(0.96 0.005 270);
			border-color: oklch(0.18 0.005 270);
		}
	}
</style>
