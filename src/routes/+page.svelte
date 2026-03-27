<script lang="ts">
  import { goto } from "$app/navigation";
  import { signOut, isAuthenticated } from "$lib/auth";
  import { APP_NAME, APP_SHORT_NAME } from "$lib/config";
  import { onMount } from "svelte";

  async function handleSignOut() {
    const result = await signOut();
    if (result.success) {
      goto("/login");
    }
  }

  onMount(() => {
    if (!isAuthenticated()) {
      goto("/login");
    }
  });
</script>

<svelte:head>
  <title>{APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-black text-white">
  <main class="flex min-h-screen flex-col justify-between px-8 py-8 pb-28 sm:px-10 sm:py-10 sm:pb-32">
    <div class="flex items-center justify-between text-sm text-white/45">
      <span class="tracking-[0.28em] uppercase">{APP_SHORT_NAME}</span>
      <button
        type="button"
        onclick={handleSignOut}
        class="text-white/45 transition hover:text-white"
      >
        Sign out
      </button>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <div class="space-y-3 text-center">
        <h1 class="text-5xl font-light tracking-tight text-white sm:text-7xl">{APP_NAME}</h1>
        <p class="text-sm text-white/35 sm:text-base">Personal fullstack template online.</p>
      </div>
    </div>
  </main>
</div>
