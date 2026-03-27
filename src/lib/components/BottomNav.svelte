<script lang="ts">
  import { page } from "$app/state";

  const items = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/settings", label: "Settings" }
  ];

  const isActive = (href: string) => page.url.pathname === href;
</script>

<nav class="fixed inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-6 sm:pb-6">
  <div class="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl">
    {#each items as item (item.href)}
      <a
        href={item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
        class={`flex min-w-20 justify-center rounded-full px-4 py-2 text-sm font-medium transition ${isActive(item.href) ? "bg-white text-black" : "text-white/45 hover:text-white"}`}
      >
        {item.label}
      </a>
    {/each}
  </div>
</nav>
