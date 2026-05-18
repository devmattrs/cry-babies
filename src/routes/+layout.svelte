<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { children, data } = $props();

	const initials = $derived(
		data.activeProfile?.name
			.split(/\s+/)
			.map((s) => s[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() ?? ''
	);

	const navLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/cries', label: 'Log' },
		{ href: '/profiles', label: 'Profiles' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-40 px-4 pt-4">
		<div class="glass mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
			<a href="/" class="flex items-center gap-2 px-1 text-base font-semibold tracking-tight">
				<span class="inline-block h-2 w-2 rounded-full bg-current opacity-60"></span>
				cry-babies
			</a>

			{#if data.user}
				<nav class="hidden items-center gap-1 sm:flex">
					{#each navLinks as link}
						<a
							href={link.href}
							class="btn-ghost"
							style:background={isActive(link.href)
								? 'oklch(0 0 0 / 0.06)'
								: undefined}
							style:color={isActive(link.href) ? 'inherit' : undefined}
						>
							{link.label}
						</a>
					{/each}
				</nav>
			{/if}

			<div class="flex items-center gap-2">
				{#if data.user}
					{#if data.activeProfile}
						<a
							href="/profiles"
							class="chip"
							title="Switch profile"
							aria-label="Active profile: {data.activeProfile.name}"
						>
							<span
								class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
								style="background: oklch(0.22 0.005 270); color: oklch(0.98 0.005 270)"
							>
								{initials}
							</span>
							<span class="hidden sm:inline">{data.activeProfile.name}</span>
						</a>
					{/if}
					<form method="POST" action="/logout" use:enhance>
						<button class="btn-ghost" type="submit" aria-label="Sign out">Sign out</button>
					</form>
				{:else if page.url.pathname !== '/login' && page.url.pathname !== '/register'}
					<a href="/login" class="btn-ghost">Sign in</a>
					<a href="/register" class="btn-primary">Get started</a>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
		{@render children()}
	</main>

	<footer class="muted px-4 py-6 text-center text-xs">
		cry-babies · neutral.glass
	</footer>
</div>
