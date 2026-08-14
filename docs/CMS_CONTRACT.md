# CMS contract for Ozon671Games

This document defines the first backend-facing contract for the static prototype.

## Core rules

1. Public UI must never invent official price, stock, edition size, duration, year, age rating or canon status.
2. Media may be published only when the asset has `rightsStatus: "cleared"`.
3. Any asset with `aiDisclosure: "ai-assisted"` or `"ai-generated"` must receive a visible AI label in the public UI.
4. Transcripts are publishable only when `transcriptRightsStatus: "cleared"`.
5. Fan works and alternate versions stay separate from verified canon.
6. Orders and payments are server-owned records. Browser localStorage is demo state only.
7. Product price and stock are server/CMS data and must not be hardcoded into the storefront.

## Entities

- works
- chapters
- assets
- films
- characters
- products
- orders
- events
- comments
- external links

The TypeScript definitions live in `app/data/cms-contract.ts`.

## Suggested API boundary

The current static app should later consume read-only endpoints such as:

- `GET /api/works`
- `GET /api/works/:slug`
- `GET /api/films`
- `GET /api/characters`
- `GET /api/products`
- `GET /api/events`

Authenticated endpoints should own user progress, favorites, purchases, orders and notifications. Administrative writes should never be exposed through the public client bundle.

## Deployment note

GitHub Pages remains suitable for the static public frontend. Real CMS/admin, authentication, order processing, payment webhooks and device synchronization require a separate backend/runtime.
