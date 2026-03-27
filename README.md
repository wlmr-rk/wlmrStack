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
bun run dev
```

## Setup

### 1. Install dependencies

```sh
bun install
```

### 2. Create local env

Copy `.env.example` to `.env.local` and fill it in:

```sh
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
TOTP_SECRET=
TOTP_ISSUER=Starter App
TOTP_LABEL=Owner
```

Optional local CLI helper:

```sh
CONVEX_DEPLOYMENT=
```

### 3. Generate a TOTP secret

```sh
bun run generate-totp
```

Then add the generated values where they belong.

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
