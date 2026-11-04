# Sagacious Footies — Step in Style

Premium storefront and owner dashboard for **Sagacious Footies**, handcrafted
sandals from Shop B7/7 Onyeahalanwaneeya Line, Shoe Plaza, Ariaria
International Market, Aba, Abia State, Nigeria.

Customers browse, pick sizes and quantities, build a selection, and send a
prefilled order to WhatsApp (`2347044663337`). The owner manages everything at
`/admin` and changes appear on the store instantly — no redeploys.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript (strict) ·
Tailwind CSS v4 · shadcn/ui (Base UI) · Convex (data, storage, live queries) ·
Motion · Sonner · Day.js.

## How it works

- **Live catalogue.** Pages stream an SSR snapshot from Convex (`preloadQuery`)
  and then stay subscribed, so price, photo, size and settings changes show up
  without a refresh. Nothing about products is baked in at build time.
- **Selection.** Stored in `localStorage` under `sagacious-footies-cart:v1`
  (product id, slug, size, quantity only). On `/selection`, every line is
  re-checked live: missing products, sold-out sizes and price changes are
  highlighted, and WhatsApp stays disabled until they are resolved/acknowledged.
  The site never claims a message was sent — the customer presses Send.
- **Admin auth (PIN).** `/admin/login` posts the PIN to a server action, which
  calls a Convex action guarded by `ADMIN_SERVER_SECRET`. PINs are compared in
  constant time, attempts are rate-limited per IP and globally, and a random
  session token (stored hashed in Convex) is set as an httpOnly cookie scoped to
  `/admin`. Every admin query/mutation re-verifies the token on the server.
  The owner can change the PIN in **Settings → Security** (stored as a salted
  PBKDF2 hash; other devices are signed out).
- **PWA.** `app/manifest.ts`, icons in `public/icons`, and a minimal
  `public/sw.js` (offline page + hashed static assets only; it never caches
  Convex data, admin pages or cross-origin requests).
- **SEO.** Per-page metadata, canonical URLs, Open Graph image, `sitemap.xml`,
  `robots.txt`, Product / Breadcrumb / ShoeStore JSON-LD.

## Local development

```bash
yarn install
npx convex dev          # first run creates/links a Convex project and writes .env.local
yarn dev                # in a second terminal → http://localhost:3000
```

One-time Convex setup:

```bash
# generate a secret and put the SAME value in .env.local and on Convex
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npx convex env set ADMIN_SERVER_SECRET <secret>
npx convex env set ADMIN_PIN 123456          # choose your own 6–12 digits
npx convex run seed:run                      # categories, settings + sample products
```

Then sign in at `/admin/login`. Sample products are named "Sample — …" and have
no photos; edit or delete them from **Admin → Products**.

## Deploying to Vercel

1. Create a production Convex deployment: `npx convex deploy` (or let Vercel run
   it — set the build command to `npx convex deploy --cmd 'yarn build'` and add
   `CONVEX_DEPLOY_KEY` from the Convex dashboard).
2. On the **production** Convex deployment set `ADMIN_SERVER_SECRET` and
   `ADMIN_PIN` (`npx convex env set --prod …`), then `npx convex run --prod seed:run`.
3. In Vercel → Environment Variables set `NEXT_PUBLIC_APP_URL`
   (e.g. `https://sagaciousfooties.com`), `ADMIN_SERVER_SECRET`, and (if not
   using the deploy command) `NEXT_PUBLIC_CONVEX_URL`.
4. Add your domain in Vercel and update `NEXT_PUBLIC_APP_URL` to match.

After that, products, prices, photos, sizes, categories and settings are all
managed from `/admin` — deploys are only needed for code changes.

## Project layout

```
app/(store)/      storefront routes (home, shop, product, categories, selection, about, contact, legal)
app/admin/        PIN login, server actions, protected panel (overview, products, categories, enquiries, settings)
components/       ui (shadcn), store, cart, admin, brand
convex/           schema, public catalog/settings queries, admin/* functions, adminAuth, seed
lib/              site config, currency, WhatsApp message builder, cart store
public/sw.js      service worker
```

## Scripts

`yarn dev` · `yarn build` · `yarn start` · `yarn lint` · `npx tsc --noEmit`
