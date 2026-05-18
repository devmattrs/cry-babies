<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let submitting = $state(false);
</script>

<div class="mx-auto max-w-sm pt-8">
	<div class="glass p-7">
		<header class="mb-6">
			<h1 class="text-xl font-semibold tracking-tight">Welcome back</h1>
			<p class="muted mt-1 text-sm">Log in to access your profiles.</p>
		</header>
		<form
			method="POST"
			class="flex flex-col gap-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<label class="flex flex-col gap-1.5">
				<span class="label-text">Email</span>
				<input
					class="input-glass"
					type="email"
					name="email"
					required
					autocomplete="email"
					value={form?.email ?? ''}
				/>
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="label-text">Password</span>
				<input
					class="input-glass"
					type="password"
					name="password"
					required
					autocomplete="current-password"
				/>
			</label>
			{#if form?.error}
				<p class="text-sm" style="color: oklch(0.55 0.18 25)">{form.error}</p>
			{/if}
			<button class="btn-primary mt-2" type="submit" disabled={submitting}>
				{submitting ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
		<footer class="muted mt-5 text-center text-sm">
			No account?
			<a href="/register" class="underline underline-offset-4">Create one</a>
		</footer>
	</div>
</div>
