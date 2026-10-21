# Mobile app notes

Handoff file for new chats. Update at the end of every phase.

## Goal

Production mobile ecommerce app (Amazon/eBay-like, smaller scale). Frontend only.
Backend (Express + Drizzle + PostgreSQL + Better Auth) and the Next.js web app already exist.

## Stack and environment

- Expo SDK 57 (`expo ~57.0.29`), expo-router, React Native 0.86, NativeWind 4 (Tailwind 3.4)
- @tanstack/react-query for server state, expo-image for images
- Bun: `bunx expo install` for Expo packages, `bun add` for pure JS
- Dev machine: old iMac (Monterey). Testing on iPhone with Expo Go.
- Run `bunx expo start --clear` after config or env changes.
- API URL lives in `mobile/.env.local` as `EXPO_PUBLIC_API_URL` (local IP, may change; backend port 5000).
- Path alias: `@/*` -> `src/*`

## Working style

- The owner retypes all code to learn. Give code in small chunks with explanations.
- The assistant's sandbox cannot compile or push. Ask for pasted errors.
- Visual style should resemble the web app (shadcn look).

## Phases

0 setup (done) | 1 API client/types (done) | 2 home + product detail (done)
3 catalog: search, category chips, sort (in progress), then brand/price filter sheet
4 auth (Better Auth Expo) | 5 cart | 6 checkout/orders | 7 profile + Stream chat | 8 polish, dev build

## Structure

- `src/app/`: routes (index = home, catalog, product/[slug])
- `src/components/`: product-card, image-carousel, sort-sheet
- `src/hooks/`: use-home-catalog, use-product-details, use-products-catalog, use-debounced-value
- `src/lib/`: api.ts (apiFetch + ApiError), format.ts, query-string.ts, sort-options.ts
- `src/types/api.ts`: response types

## Backend contract (essentials)

- `GET /api/products?category=&q=&brand=a,b&minPrice=&maxPrice=&sort=&featured=&page=&limit=`
  - prices in cents, limit capped at 48
  - returns `{ products, pagination, facets: { brands, price } }`
  - facets ignore brand/price filters; absent for unknown category
- `GET /api/products/categories`, `/suggest?q=`, `/:slug`
- Sort: `relevance | newest | price_asc | price_desc | rating`. Relevance only with `q`.
- Cart `/api/cart...` (guest needs `x-cart-session-id`), checkout `POST /api/checkout`, orders `/api/orders`.
- Errors are `{ error: "message" }`.
- Drizzle: use `generate` + `migrate`, never `push`.

## Gotchas

- `rating` is a string ("4.50"); JSON dates are strings. Rating UI deferred (web ratings redesign pending).
- NativeWind scans source: write full class names inside ternaries.
- NativeWind does not style expo-image via className: use `style`.
- Opacity on custom colors (`bg-foreground/25`) did not apply: use inline hex.
- Stack `contentStyle` must be set to white (default is #f2f2f2). Use "#ffffff" with the "#".
- Two-column FlatList cells use `w-1/2`, not `flex-1`, to avoid a stretched last row.
- A component that returns JSX needs an explicit `return` when its body uses braces.
- Every useQuery needs its own queryKey. Two queries with the same key share one cache
  entry and overwrite each other's data.
- RN ScrollView has flexShrink: 1 by default: give a horizontal chip row `flexShrink: 0`
  and a fixed height, or a big FlatList beside it will squeeze it.
- Mobile catalog hits `/api/products` with relevance sort whenever `q` is set; the backend
  `similarity(...) DESC` order-by was fixed (parenthesis).

## Open items

- Bottom tabs: Home, Catalog, Cart, Account (move routes into `(tabs)`)
- Brand/price filter sheet using `facets`
- Bottom tabs: Home, Catalog, Cart, Account (move routes into `(tabs)`)
- Backend (owner side): Better Auth Expo plugin + trustedOrigins, `x-cart-session-id` support,
  mobile-aware checkout return URL, Polar webhook missing `return` after the 500,
  profile/address endpoints, ratings table.

## Last updated

Phase 3 mobile catalog done (search, category chips, sort, infinite scroll).
