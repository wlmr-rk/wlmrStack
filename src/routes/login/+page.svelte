<script lang="ts">
  import { authenticateWithTOTP, isAuthenticated } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { APP_NAME } from "$lib/config";
  import { onMount } from "svelte";

  const CODE_LENGTH = 6;
  const SUCCESS_DELAY_MS = 180;
  const ERROR_DELAY_MS = 500;
  const ERROR_ANIMATION_MS = 320;

  const focusCodeInput = () => document.getElementById("totp")?.focus();
  const sanitizeCode = (value: string) => value.replace(/\D/g, "").slice(0, CODE_LENGTH);

  onMount(() => {
    if (isAuthenticated()) {
      goto("/");
      return;
    }

    focusCodeInput();
  });

  let code = $state("");
  let loading = $state(false);
  let flashError = $state(false);
  let flashSuccess = $state(false);
  let errorAnimation = $state(false);

  function inputClasses() {
    if (flashError) {
      return "text-red-600";
    }

    if (flashSuccess) {
      return "text-emerald-300";
    }

    if (loading) {
      return "text-yellow-300";
    }

    return "text-white";
  }

  const maskedValue = () => "•".repeat(code.length);

  function playErrorAnimation() {
    errorAnimation = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        errorAnimation = true;
      });
    });

    window.setTimeout(() => {
      errorAnimation = false;
    }, ERROR_ANIMATION_MS);
  }

  function triggerErrorState() {
    flashSuccess = false;
    flashError = true;
    playErrorAnimation();

    window.setTimeout(() => {
      code = "";
      flashError = false;
      focusCodeInput();
    }, ERROR_DELAY_MS);
  }

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    code = sanitizeCode(target.value);

    if (code.length === CODE_LENGTH && !loading) {
      void submitCode();
    }
  }

  async function submitCode() {
    flashError = false;
    flashSuccess = false;
    loading = true;

    const result = await authenticateWithTOTP(code);

    loading = false;

    if (result.success) {
      flashSuccess = true;
      window.setTimeout(() => {
        goto("/");
      }, SUCCESS_DELAY_MS);
    } else {
      triggerErrorState();
    }
  }
</script>

<svelte:head>
  <title>Login · {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-black text-white flex items-center justify-center px-8">
  <div class="relative w-full">
    {#if code.length === 0}
      <span class="dot-cursor pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></span>
    {/if}

    <div
      aria-hidden="true"
      class={`pointer-events-none absolute inset-0 flex items-center justify-center text-center text-7xl font-light tracking-[0.3em] ${inputClasses()} ${errorAnimation ? "error-flash" : ""}`}
    >
      {maskedValue()}
    </div>

    <input
      id="totp"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="6"
      autocomplete="one-time-code"
      bind:value={code}
      oninput={handleInput}
      aria-label="Authentication code"
      aria-invalid={flashError ? "true" : "false"}
      class="w-full border-0 bg-transparent px-0 py-3 text-center text-7xl font-light tracking-[0.3em] text-transparent caret-transparent outline-none"
    />
  </div>
</div>

<style>
  .dot-cursor {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 9999px;
    background: currentColor;
  }

  .error-flash {
    animation: fail-shift 0.32s ease-in-out;
  }

  @keyframes fail-shift {
    0%, 100% {
      transform: translateX(0);
    }

    20% {
      transform: translateX(-10px);
    }

    40% {
      transform: translateX(8px);
    }

    60% {
      transform: translateX(-6px);
    }

    80% {
      transform: translateX(4px);
    }
  }
</style>
