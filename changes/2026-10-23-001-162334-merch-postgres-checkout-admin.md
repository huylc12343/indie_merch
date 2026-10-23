# Merch PostgreSQL checkout and admin

- Created: 2026-10-23T16:23:34+07:00
- Updated: 2026-10-23T16:48:35+07:00

## Request

Implement merch selection through checkout and payment, store orders and stock in SQL, and provide an admin page. Keep the catalog source configurable for PostgreSQL, mock data, or Directus. Apply the repository Agent-rules and Ponytail workflow to keep implementation focused and token-efficient.

## Changes

- Added PostgreSQL schema, seed data, Docker Compose configuration, database setup, and SQL-backed order, inventory, discount reservation, and payment flows.
- Added the admin page and authenticated admin APIs for products and orders.
- Added configurable catalog loading with `MERCH_DATA_SOURCE=postgres|mock|directus`; Directus catalog data is synchronized into PostgreSQL.
- Added a standalone start script that loads `.env.local` before starting Next.js, so environment-based admin configuration works in standalone mode.
- Updated README setup and configuration notes.
- Prepared the `preview/merch-postgres-admin` branch for the requested Git push and Vercel Preview deployment.
- Added a UI-only mock catalog when `MERCH_DATA_SOURCE=mock` and `DATABASE_URL` is unset, following the owner's request to review the interface before connecting a cloud database.
- Replaced hardcoded bank details in the legacy ticket demo with DEMO placeholders and a non-banking demo QR URI after deployment review flagged the sensitive values. Docker Compose is excluded from the Vercel source upload.
- Deployed commit `b300a9b3e319eb294c21bc7ee17669a3e8c30bd5` directly through the Vercel API as a Preview, with `MERCH_DATA_SOURCE=mock` for the preview environment.

## Important files

- `db/schema.sql`, `db/seed.sql`, `docker-compose.yml`
- `lib/db.ts`, `lib/orders.ts`, `lib/fetchMerch.ts`, `lib/admin-auth.ts`
- `app/admin/`, `app/api/admin/`, `app/api/orders/`
- `scripts/db-setup.mjs`, `scripts/start-standalone.mjs`, `package.json`
- `README.md`

## Decisions and assumptions

- PostgreSQL is the default catalog source and remains the system of record for products, stock, orders, payments, and admin data.
- Mock mode uses bundled product images with catalog values from the SQL seed data.
- Directus mode imports the legacy catalog into PostgreSQL; order and inventory changes remain SQL-backed.
- Environment secrets stay in `.env.local`; they are not recorded here.

## Verification

- `npm run build` and `npx tsc --noEmit` passed during earlier verification of this implementation.
- Standalone runtime smoke check served `/admin` and verified the configured admin login/session flow.
- `git diff --check` passed on 2026-10-23.
- TypeScript and the changed-file whitespace check passed again after the UI Preview and demo-payment adjustments.
- Vercel deployment `dpl_BhdHPPP6ou7qsCFFNKAd957td9bW` reached `READY`. The homepage, `/check-out`, and `/admin` returned HTTP 200; the homepage HTML contains the mock catalog and bundled merch image paths.
- Preview URL: https://indie-merch-86bgk23r2-nguyen-quang-huys-projects-bd214c44.vercel.app

## Remaining risks

- Full database-backed checkout and payment could not be verified: the `pg` dependency is unavailable in the offline npm cache, and the local Docker/PostgreSQL engine could not be started in this environment. The authenticated products API returned 503 while `pg` was missing.
- RTK 0.50.0 is present, but its gain database could not be opened and no automatic hook is installed; native git commands were used where needed.
- GitHub connectivity is blocked by the configured network proxy. The owner approved Vercel team access and selected UI-only review; no cloud PostgreSQL database was connected, so database-backed checkout and admin persistence remain unavailable in this Preview.
- The local dependency lock could not be regenerated with npm because registry access is blocked. The Preview uses `npm install --package-lock=false` to install dependencies on Vercel.
