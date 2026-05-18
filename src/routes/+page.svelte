<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto flex max-w-2xl flex-col items-center gap-7 pt-16 pb-10 text-center">
	<div class="glass-tight inline-flex items-center gap-2 px-3 py-1 text-xs">
		<span class="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50"></span>
		<span class="muted">a calmer way to track the chaos</span>
	</div>
	<h1 class="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
		Track every cry, find the pattern.
	</h1>
	<p class="muted max-w-xl text-balance text-lg">
		Log when, why, and how hard. Switch between profiles for each little one. Spot the rhythms
		behind the noise.
	</p>
	<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
		{#if data.user}
			<a href="/dashboard" class="btn-primary">Open dashboard</a>
			<a href="/profiles" class="btn-glass">Switch profile</a>
		{:else}
			<a href="/register" class="btn-primary">Create an account</a>
			<a href="/login" class="btn-glass">Sign in</a>
		{/if}
	</div>
</div>
