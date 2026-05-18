<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let creating = $state(false);
	let newName = $state('');

	function initials(name: string) {
		return name
			.split(/\s+/)
			.map((s) => s[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}
</script>

<div class="flex flex-col gap-8">
	<header>
		<h1 class="text-3xl font-semibold tracking-tight">Profiles</h1>
		<p class="muted mt-1 text-sm">Pick a profile to continue, or add another.</p>
	</header>

	{#if data.profiles.length > 0}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.profiles as profile (profile.id)}
				{@const isActive = profile.id === data.activeProfileId}
				<div
					class="glass flex items-center justify-between gap-3 p-4"
					style:outline={isActive ? '2px solid oklch(0.22 0.005 270)' : undefined}
					style:outline-offset={isActive ? '-1px' : undefined}
				>
					<div class="flex items-center gap-3 overflow-hidden">
						<span
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
							style="background: oklch(0.22 0.005 270); color: oklch(0.98 0.005 270)"
						>
							{initials(profile.name)}
						</span>
						<div class="overflow-hidden">
							<p class="truncate font-medium">{profile.name}</p>
							{#if isActive}
								<p class="muted text-xs">Currently active</p>
							{:else}
								<p class="muted text-xs">Inactive</p>
							{/if}
						</div>
					</div>
					<div class="flex shrink-0 items-center gap-1.5">
						{#if !isActive}
							<form method="POST" action="?/switch" use:enhance>
								<input type="hidden" name="profileId" value={profile.id} />
								<button class="btn-glass !px-3 !py-1.5 text-xs" type="submit">Use</button>
							</form>
						{/if}
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => ({ update }) => update({ reset: false })}
						>
							<input type="hidden" name="profileId" value={profile.id} />
							<button
								class="btn-ghost"
								type="submit"
								aria-label="Delete profile"
								onclick={(e) => {
									if (!confirm(`Delete ${profile.name}? All cries logged for this profile will be removed.`)) e.preventDefault();
								}}
							>
								Delete
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="glass p-8 text-center">
			<p class="muted">No profiles yet — create your first one below.</p>
		</div>
	{/if}

	<div class="glass p-6">
		<h2 class="text-base font-semibold">Add a profile</h2>
		<p class="muted mb-4 text-sm">Each profile has its own cry log and stats.</p>
		<form
			method="POST"
			action="?/create"
			class="flex flex-col gap-3 sm:flex-row sm:items-end"
			use:enhance={() => {
				creating = true;
				return async ({ update }) => {
					await update();
					creating = false;
					newName = '';
				};
			}}
		>
			<label class="flex flex-1 flex-col gap-1.5">
				<span class="label-text">Profile name</span>
				<input
					class="input-glass"
					name="name"
					placeholder="e.g. Maeve, Theo, the twins"
					maxlength="50"
					required
					bind:value={newName}
				/>
			</label>
			<button class="btn-primary" type="submit" disabled={creating || !newName}>
				{creating ? 'Adding…' : 'Add profile'}
			</button>
		</form>
		{#if form?.error}
			<p class="mt-2 text-sm" style="color: oklch(0.55 0.18 25)">{form.error}</p>
		{/if}
	</div>
</div>
