# Template Setup

This starter is designed for small personal apps built with:

- SvelteKit
- Convex
- Bun
- PWA support
- single-user TOTP login

## 1. Install dependencies

```sh
bun install
```

## 2. Create local env

Copy `.env.example` to `.env.local` and fill it in:

```sh
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
```

Optional local CLI helper:

```sh
CONVEX_DEPLOYMENT=
```

## 3. Generate a TOTP secret

```sh
bun run generate-totp
```

Then add the generated values where they belong.

## 4. Set Convex env vars

Set these in Convex:

```sh
TOTP_SECRET=
TOTP_ISSUER=Starter App
TOTP_LABEL=Owner
```

## 5. Set Vercel env vars

Set these in Vercel:

```sh
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
```

## 6. Rename app copy

Update these if you want custom branding:

- `package.json`
- `src/lib/config.ts`
- `src/convex/auth.ts`
- `scripts/generate-totp.ts`

## 7. Run locally

```sh
bun run dev
```
