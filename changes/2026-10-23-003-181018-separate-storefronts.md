# Separate ticket and merch projects

- Created: 2026-10-23T18:10:18+07:00
- Updated: 2026-10-23T18:17:21+07:00

## Request

Keep the gapgap-ticket design and run tickets and merch as independent projects/subdomains while retaining the shared admin.

## Changes

- Replaced the duplicated ticket storefront with a redirect to NEXT_PUBLIC_TICKET_SITE_URL and removed the custom ticket shop component.
- Updated merch/admin navigation to the separate ticket project. The shared admin and ticket catalog/order APIs remain here for SQL-backed integration.
- Extended the Directus importer to accept original gapgap-ticket fields date_start, price_sale/price_original, benefits, and quantity_total/quantity_sold.
- Added a ticket-source response header and environment documentation for the two-project connection.

## Limits and verification

- The original ticket interface is maintained in D:/legacy-git-clones/gapgap-ticket and deployed independently. Missing content uses placeholders there.
- Mock localStorage is separate per origin. Shared admin data uses the configured API/PostgreSQL in real modes.
- TypeScript and whitespace checks passed for the redirect/navigation and importer changes. Preview verification is in progress.
