<script lang="ts">
  import { goto } from "$app/navigation";
  import { isAuthenticated, signOut } from "$lib/auth";
  import { APP_NAME } from "$lib/config";
  import { onMount } from "svelte";

  onMount(() => {
    if (!isAuthenticated()) {
      goto("/login");
    }
  });

  async function handleSignOut() {
    const result = await signOut();
    if (result.success) {
      goto("/login");
    }
  }
</script>

<svelte:head>
  <title>Settings · {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-black text-white">
  <main class="flex min-h-screen items-center px-8 py-8 pb-28 sm:px-10 sm:py-10 sm:pb-32">
    <div class="w-full space-y-6">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.28em] text-white/35">Settings</p>
        <h1 class="text-4xl font-light tracking-tight sm:text-6xl">Template controls.</h1>
      </div>

      <button
        type="button"
        onclick={handleSignOut}
        class="text-sm text-white/45 transition hover:text-white"
      >
        Sign out
      </button>
    </div>
  </main>
</div>
