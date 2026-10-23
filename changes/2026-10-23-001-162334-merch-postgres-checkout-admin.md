# Merch PostgreSQL checkout and admin

- Created: 2026-10-23T16:23:34+07:00
- Updated: 2026-10-23T17:01:42+07:00

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
- Enabled all bundled merch for purchase and added `NEXT_PUBLIC_DEMO_MODE` for the requested complete browser demo: localStorage products, stock reservations, orders, discounts, payment completion, and admin management.
- Added an explicitly labeled Google Demo sign-in for the browser-only admin. The real server admin authentication and PostgreSQL routes retain their existing checks.
- Added a client catalog that reflects admin edits and stock changes from the same browser, including changes made in another tab.
- The mock success screen links to admin and explains that demo orders do not send email or charge real money.

## Important files

- `db/schema.sql`, `db/seed.sql`, `docker-compose.yml`
- `lib/db.ts`, `lib/orders.ts`, `lib/fetchMerch.ts`, `lib/admin-auth.ts`
- `app/admin/`, `app/api/admin/`, `app/api/orders/`
- `scripts/db-setup.mjs`, `scripts/start-standalone.mjs`, `package.json`
- `README.md`
- `lib/mock-store.ts`, `lib/localMerch.ts`, `components/merchInfo/merchCatalog.tsx`

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
- TypeScript passed after the complete mock flow was added. An isolated localStorage verification exercised all six available products, Google Demo session/login/logout, canonical pricing, `INDI10`, delivery shipping, order persistence, payment idempotency, admin edits, cancellation/expiry stock release, and invalid quantities/variants.
- Full mock Preview `dpl_GkFE7WLTvrjfjJrVFe3ztqP7sgL9` reached `READY`, built from commit `53f1e89fe34af16ecc17a0a864c17e7ddb19f544`. The homepage, checkout, and admin returned HTTP 200; the homepage serialized all six products with `soldOut=false`, and the admin rendered the Google Demo sign-in button.
- Full mock Preview URL: https://indie-merch-hag1nn7kp-nguyen-quang-huys-projects-bd214c44.vercel.app

## Remaining risks

- Full database-backed checkout and payment could not be verified: the `pg` dependency is unavailable in the offline npm cache, and the local Docker/PostgreSQL engine could not be started in this environment. The authenticated products API returned 503 while `pg` was missing.
- RTK 0.50.0 is present, but its gain database could not be opened and no automatic hook is installed; native git commands were used where needed.
- GitHub connectivity is blocked by the configured network proxy. The owner approved Vercel team access and selected UI-only review; no cloud PostgreSQL database was connected, so database-backed checkout and admin persistence remain unavailable in this Preview.
- The local dependency lock could not be regenerated with npm because registry access is blocked. The Preview uses `npm install --package-lock=false` to install dependencies on Vercel.
- Full mock mode stores data in localStorage, shared only within the same browser and Preview hostname. Google sign-in is simulated; no Google identity or real payment is processed.
