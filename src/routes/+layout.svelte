<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { page } from '$app/state';
	import { setupConvex } from "convex-svelte";
	import { onMount } from 'svelte';

	onMount(() => {
		// process.env gets replaced with actual value at build time
		const url = process.env.PUBLIC_CONVEX_URL;
		if (!url) {
			console.error('PUBLIC_CONVEX_URL is not set. Check your .env.local file.');
			return;
		}
		setupConvex(url);
	});

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

{#if page.url.pathname !== '/login'}
	<BottomNav />
{/if}
