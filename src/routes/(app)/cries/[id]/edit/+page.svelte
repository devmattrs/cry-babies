<script lang="ts">
	import CryForm from '$lib/components/CryForm.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const initial = $derived({
		occurredAt: data.cry.occurredAt,
		durationMinutes: data.cry.durationSeconds != null ? data.cry.durationSeconds / 60 : null,
		intensity: data.cry.intensity,
		reason: data.cry.reason,
		trigger: data.cry.trigger,
		soothedBy: data.cry.soothedBy,
		location: data.cry.location,
		hadTears: data.cry.hadTears,
		wasSoothed: data.cry.wasSoothed,
		notes: data.cry.notes
	});
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6">
	<header>
		<a href="/cries" class="btn-ghost -ml-2 mb-3 inline-flex">← Cry log</a>
		<h1 class="text-3xl font-semibold tracking-tight">Edit cry</h1>
		<p class="muted mt-1 text-sm">In {data.profile.name}'s log.</p>
	</header>
	<CryForm {initial} formError={form?.error} submitLabel="Save changes" cancelHref="/cries" />
</div>
