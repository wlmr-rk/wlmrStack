<script lang="ts">
  import { APP_NAME } from "$lib/config";
</script>

<svelte:head>
  <title>About · {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-black text-white">
  <main class="flex min-h-screen items-center px-8 py-8 pb-28 sm:px-10 sm:py-10 sm:pb-32">
    <div class="space-y-4">
      <p class="text-xs uppercase tracking-[0.28em] text-white/35">About</p>
      <h1 class="text-4xl font-light tracking-tight sm:text-6xl">Single-user starter.</h1>
      <p class="max-w-md text-sm leading-7 text-white/45 sm:text-base">
        Personal app shell with SvelteKit, Convex, PWA support, and a minimal one-user authentication flow.
      </p>
    </div>
  </main>
</div>
