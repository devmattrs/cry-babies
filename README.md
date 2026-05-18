# cry-babies

A calm, glassy cry tracker. SvelteKit + Drizzle (Postgres) + [Skeleton v3](https://www.skeleton.dev/docs/svelte/get-started/installation/sveltekit), with email/password auth and per-account profiles.

## Stack
- SvelteKit 2 / Svelte 5
- Drizzle ORM + `postgres-js`
- Tailwind v4 + Skeleton v3 (custom neutral/glass design layer on top of the `cerberus` theme)
- Argon2id password hashing (`@node-rs/argon2`) + DB-backed session cookies (`@oslojs/crypto`)

## Setup

1. Install:
   ```sh
   npm install
   ```
2. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgres://user:pass@localhost:5432/cry_babies"
   ```
3. Push the schema:
   ```sh
   npm run db:push
   ```
4. Run:
   ```sh
   npm run dev -- --open
   ```

## Data model
- **users** — email + Argon2id `password_hash`
- **profiles** — many per user (e.g. one per child)
- **sessions** — user + `active_profile_id`
- **cry_events** — per profile: `occurred_at`, `duration_seconds`, `intensity` (1–10), `reason`, `trigger`, `soothed_by`, `location`, `had_tears`, `was_soothed`, `notes`

## Routes
| Path | Purpose |
| --- | --- |
| `/` | Landing |
| `/register`, `/login`, `/logout` | Auth |
| `/profiles` | List/create/switch/delete profiles |
| `/dashboard` | Stats + charts + recent cries for the active profile |
| `/cries` | Full log with search + intensity/reason filters |
| `/cries/new` | Log a cry |
| `/cries/[id]/edit` | Edit an entry |

## Design system
A small CSS layer in `src/routes/layout.css` defines neutral glass tokens:
- `.glass` / `.glass-tight` — translucent cards with backdrop blur
- `.input-glass`, `.btn-glass`, `.btn-primary`, `.btn-ghost`, `.chip`
- `.muted`, `.label-text`, `.divider`

All tokens auto-flip via `prefers-color-scheme: dark`.
