<script lang="ts">
	import CryForm from '$lib/components/CryForm.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6">
	<header>
		<a href="/dashboard" class="btn-ghost -ml-2 mb-3 inline-flex">← Dashboard</a>
		<h1 class="text-3xl font-semibold tracking-tight">Log a cry</h1>
		<p class="muted mt-1 text-sm">Adding to {data.profile.name}'s log.</p>
	</header>
	<CryForm formError={form?.error} submitLabel="Log cry" cancelHref="/dashboard" />
</div>
