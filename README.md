# wlmrStack

A personal fullstack starter for mobile-first web apps.

## Includes

- SvelteKit + Svelte 5
- Convex backend and realtime foundation
- Bun workflow
- Vercel adapter
- PWA setup
- minimal single-user TOTP authentication
- reusable bottom navigation shell

## Good fit

Use this when you want a fast personal app starter without going native.

Examples:

- dashboards
- trackers
- note tools
- health or metrics viewers
- internal single-user utilities

## Quick start

```sh
bun install
bun run init
bun run dev
```

## Setup

### 1. Install dependencies

```sh
bun install
```

### 2. Create local env

Run the interactive initializer:

```sh
bun run init
```

What it does:

- creates `.env.local` from `.env.example` if needed
- keeps Vercel as the default deployment target
- generates or reuses your TOTP secret
- prints a terminal QR code with a valid `otpauth://` payload for Google Authenticator
- optionally prompts for `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, and `CONVEX_DEPLOYMENT`
- explains which values belong in local env, Vercel, and Convex

If you prefer the manual path, copy `.env.example` to `.env.local` and fill it in yourself.

```sh
cp .env.example .env.local
```

Optional local CLI helper:

```sh
CONVEX_DEPLOYMENT=
```

### 3. Generate a TOTP secret

```sh
bun run generate-totp
```

This standalone helper updates `.env.local` with `TOTP_SECRET`, `TOTP_ISSUER`, and `TOTP_LABEL`.
It also prints a terminal QR code, plus the `otpauth://` URI and raw secret as fallbacks.

If you use `bun run init`, you usually do not need this separate step.

Then fill in the remaining values manually if needed:

```sh
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
```

### 4. Set production server env vars

Set these in Vercel:

```sh
TOTP_SECRET=
TOTP_ISSUER=Starter App
TOTP_LABEL=Owner
```

The stack uses `TOTP_SECRET` for both code verification and session signing so the setup stays one-secret and simple.

### 5. Set public app env vars

Set these in Vercel:

```sh
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
```

What goes where:

- `PUBLIC_CONVEX_URL`: your Convex deployment URL. Set it locally and in Vercel.
- `PUBLIC_CONVEX_SITE_URL`: your app's public URL. Use your local origin in `.env.local` and your Vercel domain in Vercel.
- `CONVEX_DEPLOYMENT`: optional local Convex CLI helper. Keep it in `.env.local` only.
- `TOTP_SECRET`: secret used for TOTP verification and session signing. Set it locally and in Vercel.
- `TOTP_ISSUER` and `TOTP_LABEL`: values shown inside Google Authenticator. Set them locally and in Vercel.

### 6. Rename app copy

Update these if you want custom branding:

- `package.json`
- `src/lib/config.ts`
- `.env.example`
- `scripts/generate-totp.ts`

### 7. Run locally

```sh
bun run dev
```
