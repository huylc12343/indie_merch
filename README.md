This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Merch store and PostgreSQL

The catalog, reservations, discounts, and orders use PostgreSQL. `MERCH_DATA_SOURCE` is configurable in `.env.local`: `postgres` reads the SQL catalog (default), `mock` uses bundled sample merch imagery with SQL names, prices, and stock, and `directus` imports the legacy catalog into PostgreSQL. In Directus mode the first import also seeds stock; later imports update product details while stock, orders, payments, and admin records remain in PostgreSQL.

1. Add the variables from `.env.example` to `.env.local`. Keep your existing local environment values and set a private `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
2. Start the seeded local PostgreSQL database with `docker compose up -d`.
3. Install dependencies with `npm install`, then run `npm run dev` and open `http://localhost:3000`.
4. Open `/admin` and sign in with `ADMIN_PASSWORD` to manage inventory and orders.

Docker seeds six sample products with stock and the `INDI10` demo discount. Existing database volumes are not reseeded automatically; run `npm run db:setup` to apply the schema and insert missing seed rows. The script reads `.env.local`.

Set `MERCH_DATA_SOURCE=mock` to use bundled sample product images with the SQL seed catalog. To import the legacy catalog, set `MERCH_DATA_SOURCE=directus`, `DIRECTUS_URL`, and optionally `DIRECTUS_TOKEN`. Product IDs and prices sync to PostgreSQL; orders reserve and update stock there.

For a UI-only Preview without a database, set `MERCH_DATA_SOURCE=mock` and leave `DATABASE_URL` unset. The catalog uses bundled sample products; saving orders and admin changes still requires PostgreSQL.

For the complete browser demo, set `NEXT_PUBLIC_DEMO_MODE=true` and `MERCH_DATA_SOURCE=mock`, then rebuild. All six products are available; checkout, the `INDI10` discount, simulated payment, and admin product/order management use localStorage in the same browser. In `/admin`, choose **Tiếp tục với Google (Demo)** to enter the mock dashboard. This is simulated sign-in and payment; it does not contact Google or a bank. Data survives page reloads and is limited to that browser and Preview hostname. Set `NEXT_PUBLIC_DEMO_MODE=false` for the PostgreSQL-backed application.

`PAYMENT_SIMULATION=true` enables the demo payment path. It reveals the QR after three seconds and marks the order paid three seconds later. The displayed QR encodes a demo URI and does not transfer money. Set this to `false` when a real payment provider is connected.

## Ticket sales and the shared admin

The ticket storefront runs in the separate `gapgap-ticket` project with its original interface. Set `NEXT_PUBLIC_TICKET_SITE_URL` to its deployment URL (production: `https://ticket.indiindishow.com`). The old `/tickets` route redirects there. This project serves merch (production: `https://merch.indiindishow.com`), the shared `/admin`, and the ticket catalog/order APIs. Each SQL-paid ticket receives its own code and QR. Admins can add events and tiers, change prices/capacity, toggle sales, and view issued ticket codes.

`TICKET_DATA_SOURCE=postgres|mock|directus` selects the ticket catalog independently of `MERCH_DATA_SOURCE`:

- `postgres`: read events and ticket stock from PostgreSQL. Run `npm run db:setup` to apply the schema and seed the sample event and three ticket tiers. Orders, held stock, and issued ticket codes are stored in PostgreSQL.
- `mock`: use the sample event catalog. With `NEXT_PUBLIC_DEMO_MODE=true`, ticket orders, issued codes, and admin edits persist in the same browser alongside merch demo data. Without browser demo mode, placing orders still requires the seeded PostgreSQL database.
- `directus`: import events and ticket types into PostgreSQL using `DIRECTUS_URL` and `DIRECTUS_TOKEN`. Collection names default to `events` and `ticket_types`; override them with `TICKET_DIRECTUS_EVENTS_COLLECTION` and `TICKET_DIRECTUS_TYPES_COLLECTION`.

Directus events require `id`, `name`, `venue` (or `location`), `starts_at` (or `start_time`), and `active` or `status=published|active|available`; `description` is optional. Ticket types require `id`, `event_id` (ID or an expanded relation), `name`, `price`, `quantity` (or `stock_quantity`), and `active` or `status`. Catalog IDs are namespaced as `event-<id>` and `ticket-<id>`. The first import seeds stock; subsequent imports preserve SQL stock/reservations while refreshing source-owned catalog details. Tickets and merch have separate catalog/order kinds and cannot be mixed in one order. Each ticket order belongs to one event.

In `gapgap-ticket`, configure `TICKET_API_URL` to this API deployment and set `NEXT_PUBLIC_TICKET_DATA_SOURCE` to match this server's `TICKET_DATA_SOURCE` for PostgreSQL/Directus integration. The ticket app proxies requests from its server, so the storefronts do not depend on browser CORS or shared admin cookies. Mock localStorage remains separate for each project origin; cross-project orders are shared through the real API/PostgreSQL.

The current ticket QR identifies an issued ticket; an admission/check-in scanner and email delivery are not implemented in this shared API. In browser demo mode, Google sign-in and payment remain simulated, and existing merch demo records are preserved when ticket data is initialized.
