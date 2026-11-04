# Sagacious Footies --- Claude Code Development Specification

> **Product:** Premium handcrafted sandals storefront and administration
> platform\
> **Brand:** Sagacious Footies\
> **Tagline:** Step in Style\
> **Market:** Nigeria\
> **Currency:** NGN (₦)\
> **Primary contact / WhatsApp:** `07044663337`\
> **WhatsApp international number:** `2347044663337`\
> **Visual direction:** Warm luxury / artisan\
> **Primary objective:** A fast, mobile-first, installable storefront
> where customers browse men's and women's sandals, choose sizes and
> quantities, build a multi-product selection, and continue the order
> conversation on WhatsApp.

------------------------------------------------------------------------

## 1. Instructions to Claude Code

Build a complete, production-quality application from this
specification. Do not stop after producing a plan, mockup, or scaffold.
Implement the application incrementally, run type checks and builds, fix
errors, and leave the project in a working state.

Before implementation:

1.  Inspect the existing repository and preserve useful existing
    conventions.
2.  If the repository is empty, initialize the project using the stack
    below.
3.  Check current stable package versions and use compatible versions.
4.  Do not overwrite user-provided assets.
5.  Ask only when a genuinely blocking decision is missing. Otherwise
    use the defaults in this specification.
6.  Keep a concise implementation checklist and update it as work
    progresses.

### Non-negotiable engineering rules

-   Use strict TypeScript.
-   Never use `any`. Prefer precise types, `unknown` with narrowing, and
    inferred Convex types.
-   Use Next.js App Router.
-   Use Tailwind CSS v4. Do not create a legacy `tailwind.config.ts`
    unless a dependency demonstrably requires it.
-   Use shadcn/ui components for interface primitives.
-   Use Convex for persistent application data and real-time
    subscriptions.
-   Use Clerk for administrator authentication.
-   Use server-side authorization in every protected Convex mutation and
    query.
-   Do not rely on client-side route hiding as security.
-   Do not statically bake catalogue data into builds.
-   Do not require a Vercel deployment when products, prices, images,
    availability, categories, or store settings change.
-   Avoid unnecessary dependencies and oversized client bundles.
-   Use accessible semantic HTML and keyboard-accessible controls.
-   Do not add payment processing or a conventional checkout flow in the
    MVP.
-   Do not claim a WhatsApp message has been sent. The site only opens
    WhatsApp with a prefilled message; the customer must send it.

------------------------------------------------------------------------

## 2. Product Overview

Sagacious Footies is a cordwainer / artisan footwear business selling
handcrafted sandals for men and women.

The application has two distinct experiences:

### Public storefront

Customers can:

-   Discover men's and women's sandals.
-   Browse categories and featured designs.
-   Search and filter products.
-   View product photos and descriptions.
-   Select an available size and quantity.
-   Add multiple products to a shopping selection.
-   Review and edit their selection.
-   Open WhatsApp with a complete, prefilled order enquiry.
-   Start a direct WhatsApp conversation without selecting a product.
-   Share an individual product link.

### Private admin dashboard

The business owner can:

-   Sign in securely.
-   View a product and catalogue overview.
-   Create, edit, publish, unpublish, and delete products.
-   Upload and manage product images.
-   Create and manage categories.
-   Configure sizes and per-size availability.
-   Mark sizes as available or sold out.
-   Set product prices and descriptions.
-   Feature products and mark new arrivals.
-   Update public store settings and WhatsApp contact number.
-   Record and manage enquiries manually.

The MVP does not require customer accounts.

------------------------------------------------------------------------

## 3. Brand Identity and Visual System

Use the supplied Sagacious Footies logo artwork as the brand reference.
The owner will provide the final logo asset(s). Do not recreate or
approximate the logo in code if the supplied files are available.

### Brand character

The visual identity should communicate:

-   Craftsmanship
-   Premium quality
-   Confidence
-   Warmth
-   Elegance
-   Authentic artisan production

Avoid generic marketplace styling, loud gradients, excessive rounded
cards, neon accents, and clutter.

### Core palette

  Token           Hex         Use
  --------------- ----------- -----------------------------------------
  Warm ivory      `#F3EBDD`   Main light background
  Leather tan     `#B58A5A`   Accent, highlights, selected states
  Dark espresso   `#30271F`   Primary text, dark surfaces, buttons
  Muted taupe     `#8C806F`   Secondary text, borders, muted elements

Create CSS custom properties compatible with Tailwind CSS v4 and
shadcn/ui. Support light and dark themes. Dark mode should remain warm
espresso / deep brown rather than pure black. Light mode should not use
pure white as its dominant background.

### Typography

Use an elegant serif for editorial headings and a clean sans-serif for
interface text.

Suggested pairing:

-   `Cormorant Garamond` for display headings.
-   `DM Sans` for body text, buttons, labels, and data.

Use `next/font/google` where practical, with sensible fallback fonts.

### UI treatment

-   Generous but efficient spacing.
-   Large, high-quality footwear photography.
-   Subtle borders and restrained shadows.
-   Clear product prices and availability.
-   Strong typographic hierarchy.
-   Smooth but restrained Framer Motion transitions.
-   Respect `prefers-reduced-motion`.
-   Mobile-first layouts and touch-friendly controls.
-   Avoid oversized hero sections that push products too far down the
    page.

------------------------------------------------------------------------

## 4. Technology Stack

Use the following stack:

  -----------------------------------------------------------------------
  Technology                          Purpose
  ----------------------------------- -----------------------------------
  Next.js App Router                  Application framework, routing,
                                      rendering, metadata

  TypeScript                          Strict application typing

  Tailwind CSS v4                     Styling and responsive design

  shadcn/ui                           Accessible UI primitives

  Convex                              Database, file storage, queries,
                                      mutations, subscriptions

  Clerk                               Admin authentication

  Vercel                              Hosting and deployment

  Framer Motion                       Restrained transitions and
                                      interactions

  Lucide React                        Icons

  Sonner                              Toast notifications

  Day.js                              Date formatting where needed
  -----------------------------------------------------------------------

Use compatible current stable versions. Prefer Yarn if the repository
already uses Yarn; otherwise preserve its existing package manager and
lockfile.

### shadcn/ui components

Use the appropriate components from:

-   Button
-   Card
-   Badge
-   Dialog
-   Drawer
-   Sheet
-   Select
-   Input
-   Textarea
-   Separator
-   Skeleton
-   Tabs
-   DropdownMenu
-   AlertDialog
-   Tooltip
-   Table
-   Breadcrumb
-   Sidebar
-   Form primitives where useful
-   Sonner

Use shadcn's responsive Dialog/Drawer patterns where appropriate. Do not
build inaccessible custom substitutes for standard controls.

------------------------------------------------------------------------

## 5. Routes and Navigation

### Public routes

  Route                  Purpose
  ---------------------- ------------------------------------------
  `/`                    Main landing page and featured catalogue
  `/shop`                Full product catalogue
  `/shop/[slug]`         Product detail page
  `/categories/[slug]`   Products in a category
  `/about`               Brand story and craftsmanship
  `/contact`             Contact information and WhatsApp CTA
  `/privacy`             Privacy policy
  `/terms`               Terms of use

The homepage should function as the primary shopping destination. The
`/shop` route provides the full catalogue and additional filtering.

### Admin routes

  Route                    Purpose
  ------------------------ --------------------------------------
  `/admin`                 Dashboard overview
  `/admin/products`        Product listing and management
  `/admin/products/new`    Create product
  `/admin/products/[id]`   Edit product
  `/admin/categories`      Category management
  `/admin/enquiries`       Manually recorded customer enquiries
  `/admin/settings`        Store settings

### Navigation behaviour

Public navigation should be compact and responsive.

Desktop: - Logo - Shop - About - Contact - Shopping selection icon -
Theme toggle if included

Mobile: - Compact top header with logo and selection indicator. -
Optional fixed bottom navigation for Shop, Categories, Selection, and
Contact. - Ensure fixed navigation does not obscure page content or
action buttons.

Admin navigation should use a responsive sidebar on desktop and an
accessible mobile navigation pattern.

------------------------------------------------------------------------

## 6. Public Storefront Experience

### 6.1 Homepage

Recommended order:

1.  Header / navigation.
2.  Hero section.
3.  Men's and women's category shortcuts.
4.  Featured designs.
5.  New arrivals.
6.  Main product collection preview.
7.  Short brand story / craftsmanship section.
8.  WhatsApp contact CTA.
9.  Footer.

Suggested hero copy:

**Headline:** Crafted to Make Every Step Count.

**Supporting copy:** Discover handcrafted footwear designed for comfort,
confidence and everyday elegance.

**Primary CTA:** Explore Collection

**Secondary CTA:** Chat on WhatsApp

Use a genuine, high-quality sandal lifestyle or product image supplied
by the business. Do not use the generated logo as a hero photograph.

### 6.2 Product catalogue

Product cards should show:

-   Primary product image.
-   Product name.
-   Price in NGN.
-   Category or relevant descriptor.
-   Availability badge.
-   Featured / New badge when applicable.
-   View details or Quick View action.

Responsive grid:

-   Small mobile: 2 columns where card content remains readable.
-   Tablet: 2--3 columns.
-   Desktop: 3--4 columns depending on available width.

Include:

-   Search by product name.
-   Category filters.
-   Men's / Women's filtering.
-   Sort by newest.
-   Sort by price ascending / descending.
-   Loading skeletons.
-   Empty state.
-   Error state with retry.

Only published products should appear publicly.

### 6.3 Product details

Provide a dedicated shareable product URL at `/shop/[slug]`.

Display:

-   Product image gallery.
-   Product name.
-   Price.
-   Description.
-   Category.
-   Available sizes.
-   Per-size availability.
-   Quantity selector.
-   Add to Selection button.
-   Order Now button.
-   Share Product action.
-   Related products where useful.

On desktop, use a balanced two-column layout. On mobile, prioritize
product imagery, price, size selection, and a clear action area.

For quick view, use a shadcn Dialog on larger screens and Drawer on
mobile if it improves usability.

### 6.4 Size selection

Sizes are configurable per product. Do not assume all products share the
same size range.

Example men's sizes: 39--46.\
Example women's sizes: 36--42.

These are suggested values only. The administrator controls the actual
sizes for each product.

Each size has one of two availability values:

-   `available`
-   `sold_out`

Sold-out sizes must be visibly disabled and impossible to add to the
selection.

A product should be considered available if at least one of its sizes is
available. If all sizes are sold out, show the product as sold out and
prevent adding it to the selection.

### 6.5 Quantity selector

-   Default quantity: 1.
-   Minimum quantity: 1.
-   Use accessible increment/decrement buttons.
-   Prevent zero or negative quantities.
-   Do not impose an arbitrary stock limit because the MVP does not
    track inventory quantities.

------------------------------------------------------------------------

## 7. Shopping Selection

The selection is a lightweight cart-like feature, not a payment
checkout.

### Required behaviour

Customers can:

-   Add multiple products.
-   Add the same product in different sizes as separate line items.
-   Increase or decrease quantities.
-   Change a selected size if still available.
-   Remove a line item.
-   Clear the entire selection.
-   See a line-item subtotal and grand total.
-   Continue shopping.
-   Proceed to WhatsApp.

### Persistence

Persist selection data in `localStorage` so it survives navigation and
browser refreshes.

Use a versioned storage key, for example:

`sagacious-footies-cart:v1`

The stored data should contain only the minimum required fields:

-   Product ID.
-   Product slug.
-   Selected size.
-   Quantity.

Treat local data as untrusted. Do not trust cached product names,
prices, or availability when preparing the final WhatsApp message.

Use a typed cart context/store or a small custom hook. Avoid adding a
state library unless the implementation genuinely needs one.

### Cart validation

Before preparing a WhatsApp order:

1.  Ensure the selection contains at least one line item.
2.  Retrieve current product data from Convex.
3.  Verify every product still exists and is published.
4.  Verify each selected size is still available.
5.  Retrieve current prices.
6.  Recalculate all subtotals and the grand total.
7.  If a product, price, or availability changed, show a clear
    review/update state.
8.  Only open WhatsApp after the customer has reviewed the current order
    details.

Do not silently change a customer's order without showing the updated
details.

### Order summary

Each line item should show:

-   Product image thumbnail.
-   Product name.
-   Size.
-   Quantity.
-   Unit price.
-   Line subtotal.
-   Remove action.

Show the grand total clearly.

Delivery charges are not calculated in the MVP. State that delivery
arrangements and any applicable delivery charges will be confirmed on
WhatsApp.

------------------------------------------------------------------------

## 8. WhatsApp Integration

Business number:

-   Display format: `07044663337`
-   International format: `2347044663337`

Create a dedicated typed utility, for example:

`src/lib/whatsapp.ts`

Use:

`https://wa.me/2347044663337?text=${encodeURIComponent(message)}`

### Multi-product order message

Generate a readable message such as:

``` text
Hello Sagacious Footies,

I would like to make an order enquiry for the following:

1. Classic Leather Sandals
   Size: 42
   Quantity: 1
   Unit price: ₦18,000
   Subtotal: ₦18,000

2. Premium Slides
   Size: 43
   Quantity: 2
   Unit price: ₦15,000
   Subtotal: ₦30,000

Total: ₦48,000

Please confirm availability and provide payment and delivery details.

Thank you.
```

All values must come from validated current Convex data and the
customer's current selection.

### WhatsApp actions

Provide two distinct actions:

1.  **Proceed to WhatsApp:** Validates and prepares the complete
    multi-product selection.
2.  **Chat on WhatsApp:** Opens a direct conversation with the business
    using a short default greeting.

Use a normal external link or a safely initiated `window.open` from a
direct user interaction. Do not attempt to send a message automatically.

The app must not claim an order was placed or a message sent. The
customer must press Send in WhatsApp.

### Product-specific WhatsApp enquiry

On a product page, optionally provide an enquiry action that pre-fills
the product name and URL. If the customer has already selected a size
and quantity, include those values.

------------------------------------------------------------------------

## 9. Product Sharing

Every published product must have a stable, public URL.

Implement native Web Share API support where available, with a copy-link
fallback.

Share:

-   Product name.
-   Product URL.
-   Optional short description.

Use absolute canonical URLs. Ensure product pages have appropriate Open
Graph metadata so shared links render attractive previews in supported
messaging and social apps.

------------------------------------------------------------------------

## 10. Admin Dashboard

### 10.1 Authentication and authorization

Use Clerk for administrator sign-in.

Requirements:

-   Protect all `/admin` routes.
-   Configure one initial administrator.
-   Store or derive the administrator role securely.
-   Verify authorization inside every protected Convex function.
-   Do not trust role information supplied by the browser.
-   Do not allow public visitors to access private enquiries or admin
    settings.

Use an environment-configured initial admin identity or a securely
provisioned administrator record. Never provide an open public sign-up
path to the admin dashboard.

### 10.2 Dashboard overview

Display:

-   Total products.
-   Published products.
-   Available products.
-   Sold-out products.
-   Featured products.
-   New arrivals.

Also display recently updated products and shortcuts to add a product or
manage categories.

Do not invent sales or revenue analytics. The MVP does not process
payments or automatically receive WhatsApp orders.

### 10.3 Product management

Administrator actions:

-   Create product.
-   Edit product.
-   Delete product with confirmation.
-   Publish / unpublish.
-   Feature / unfeature.
-   Mark as new arrival.
-   Manage product sizes.
-   Change per-size availability.
-   Upload multiple images.
-   Set primary image.
-   Reorder images.
-   Remove images.
-   Search and filter products.

Product form fields:

-   Product name.
-   Slug (auto-generated but editable).
-   Short description.
-   Full description.
-   Category.
-   Price in NGN.
-   Images.
-   Sizes and availability.
-   Featured toggle.
-   New arrival toggle.
-   Published toggle.

Validate price as a positive integer in the smallest practical currency
unit (NGN naira; do not store floating-point monetary values). Display
formatted prices using `Intl.NumberFormat`.

Ensure slugs are unique.

### 10.4 Category management

Support:

-   Create category.
-   Edit category.
-   Delete category with safeguards.
-   Name.
-   Unique slug.
-   Description.
-   Optional category image.
-   Published status.

Do not allow deletion of a category that still has products assigned
without first requiring reassignment or an explicit safe resolution.

Suggested initial categories:

-   Men's Sandals.
-   Women's Sandals.
-   Unisex Designs (optional).

The owner can rename, add, or remove categories.

### 10.5 Enquiry tracking

Provide a simple manual enquiry tracker. The business owner can record
enquiries received through WhatsApp.

Fields:

-   Customer name (optional).
-   Customer phone (optional).
-   Products and sizes.
-   Quantities.
-   Unit prices at time of recording.
-   Total.
-   Status.
-   Notes.
-   Created and updated timestamps.

Statuses:

-   `new`
-   `contacted`
-   `confirmed`
-   `completed`
-   `cancelled`

This module is manual in the MVP. Do not claim that WhatsApp
conversations are automatically imported.

### 10.6 Store settings

Allow the administrator to manage:

-   Business name.
-   Tagline.
-   WhatsApp number.
-   Contact email (optional).
-   Logo.
-   Instagram URL.
-   Facebook URL.
-   Other social links if needed.
-   Delivery information.
-   Default SEO title.
-   Default SEO description.

The initial settings should use:

-   Business name: Sagacious Footies
-   Tagline: Step in Style
-   WhatsApp number: 2347044663337
-   Currency: NGN

------------------------------------------------------------------------

## 11. Convex Data Architecture

Use Convex as the source of truth for products, categories, settings,
users/roles, and manually recorded enquiries.

Use Convex Storage for product images and the logo if appropriate. Store
storage IDs in documents and resolve image URLs through Convex queries.
Do not store temporary upload URLs as permanent image references.

### 11.1 Products table

Suggested schema:

``` ts
products: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  shortDescription: v.optional(v.string()),
  price: v.number(),
  categoryId: v.id("categories"),
  images: v.array(v.object({
    storageId: v.id("_storage"),
    alt: v.string(),
  })),
  sizes: v.array(v.object({
    size: v.number(),
    availability: v.union(
      v.literal("available"),
      v.literal("sold_out")
    ),
  })),
  featured: v.boolean(),
  isNewArrival: v.boolean(),
  published: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_category", ["categoryId"])
  .index("by_published", ["published"])
```

Add indexes based on actual query patterns. Validate uniqueness of slugs
in mutation logic; Convex indexes are not unique constraints.

### 11.2 Categories table

``` ts
categories: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  imageStorageId: v.optional(v.id("_storage")),
  published: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
```

### 11.3 Enquiries table

``` ts
enquiries: defineTable({
  customerName: v.optional(v.string()),
  customerPhone: v.optional(v.string()),
  items: v.array(v.object({
    productId: v.id("products"),
    productName: v.string(),
    size: v.number(),
    quantity: v.number(),
    unitPrice: v.number(),
  })),
  totalAmount: v.number(),
  status: v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("confirmed"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_created_at", ["createdAt"])
```

Enquiry line items intentionally snapshot product name and unit price at
the time the enquiry is recorded.

### 11.4 Settings table

Use a singleton settings document or a safely managed settings record.

Suggested fields:

``` ts
settings: defineTable({
  businessName: v.string(),
  tagline: v.string(),
  whatsappNumber: v.string(),
  contactEmail: v.optional(v.string()),
  logoStorageId: v.optional(v.id("_storage")),
  instagramUrl: v.optional(v.string()),
  facebookUrl: v.optional(v.string()),
  deliveryInformation: v.optional(v.string()),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  updatedAt: v.number(),
})
```

Ensure public queries return only fields intended for public display.

### 11.5 Admin users / roles

Use Clerk as the identity provider. Maintain a Convex administrator
record associated with the Clerk identity, or use a securely configured
Clerk role/metadata strategy.

Never allow a user to grant themselves admin privileges.

Every protected Convex function must verify the authenticated identity
and administrator permission on the server.

### 11.6 Convex function organization

Suggested files:

``` text
convex/
├── schema.ts
├── auth.ts
├── products.ts
├── categories.ts
├── enquiries.ts
├── settings.ts
├── users.ts
└── lib/
    └── authorization.ts
```

Separate public queries from admin queries and mutations where clarity
or security benefits.

Public operations should expose only published products, published
categories, and public settings.

------------------------------------------------------------------------

## 12. Real-Time Updates --- No Rebuilds or Manual Refreshes

This requirement is central to the product.

Use Convex reactive queries for all dynamic catalogue information.

Expected flow:

1.  Customer opens the storefront.
2.  Next.js renders the application shell and appropriate initial
    content.
3.  The client subscribes to the relevant Convex queries.
4.  Administrator updates a product, price, image, category, size
    availability, or public setting.
5.  Convex commits the mutation.
6.  Active storefront subscriptions receive updated data.
7.  The UI updates without a full-page refresh.

Implementation rules:

-   Do not use build-time product data.
-   Do not use `generateStaticParams` as the source of truth for dynamic
    product listings.
-   Do not rely on ISR revalidation to update the catalogue.
-   Do not cache dynamic catalogue responses indefinitely.
-   Use Convex subscriptions for live product and settings data.
-   Use server components for static structure and SEO where
    appropriate.
-   Use client components only where interactivity or subscriptions
    require them.
-   Ensure product detail pages respond to product updates.
-   Handle deleted, unpublished, or missing products gracefully.

A Vercel deployment must not be required for routine dashboard changes.
Deployments should be needed only for application code, dependency,
configuration, or infrastructure changes.

------------------------------------------------------------------------

## 13. PWA Requirements

Make the storefront installable and app-like.

Implement:

-   `app/manifest.ts` or an equivalent Next.js manifest.
-   Application name: Sagacious Footies.
-   Short name: Sagacious.
-   Start URL: `/`.
-   Display mode: `standalone`.
-   Portrait-friendly mobile experience.
-   Theme and background colours consistent with the brand.
-   Appropriate 192×192 and 512×512 icons.
-   Apple touch icon where appropriate.
-   Offline fallback page.
-   Minimal service worker strategy.

### Service worker caching policy

Cache only suitable static assets and carefully selected images.

Do not cache Convex live data as permanently current. Product prices and
size availability must be refreshed from Convex when connectivity
returns.

Use network-first behaviour or the normal Convex connection strategy for
dynamic information.

Do not implement offline order submission or offline database mutations.

The service worker must not interfere with Convex WebSocket connections,
authentication, or real-time subscriptions.

If a service worker library is introduced, verify compatibility with the
selected Next.js version and deployment environment. Keep the service
worker implementation minimal.

------------------------------------------------------------------------

## 14. SEO and Social Sharing

Implement:

-   Root metadata.
-   Unique metadata for each product page.
-   Unique category metadata.
-   Canonical URLs.
-   Open Graph metadata.
-   Twitter/X card metadata.
-   `robots.ts`.
-   `sitemap.ts`.
-   Semantic headings.
-   Descriptive image alt text.
-   Product structured data using Schema.org `Product`.
-   Breadcrumb structured data where useful.

Suggested homepage title:

`Sagacious Footies | Premium Handcrafted Sandals for Men & Women`

Suggested description:

`Discover stylish handcrafted sandals for men and women at Sagacious Footies. Explore unique designs, check available sizes and order conveniently through WhatsApp.`

Product metadata must use current product information. Do not expose
unpublished products in the sitemap or structured data.

Use the eventual production domain from an environment variable or a
central site URL configuration. Do not hardcode an assumed domain
throughout the application.

------------------------------------------------------------------------

## 15. Performance, Accessibility and Quality

### Performance

-   Use `next/image` for product images.
-   Use responsive image sizes.
-   Lazy-load below-the-fold images.
-   Prioritize only the main hero image where appropriate.
-   Avoid unnecessary client components.
-   Keep dependencies lean.
-   Prevent layout shifts by specifying image dimensions/aspect ratios.
-   Avoid loading every full-size product image at once.
-   Use pagination or incremental loading if the catalogue grows.

### Accessibility

-   Semantic HTML.
-   Keyboard-accessible navigation.
-   Accessible dialogs and drawers.
-   Visible focus states.
-   Form labels and useful validation messages.
-   Sufficient colour contrast.
-   Accessible availability indicators.
-   Reduced-motion support.
-   Descriptive button labels.
-   Do not communicate availability by colour alone.

### Quality targets

Aim for Lighthouse 90+ in Performance, Accessibility, Best Practices,
and SEO, with 100 as the target where practical. Do not sacrifice
correctness or accessibility to chase a score.

------------------------------------------------------------------------

## 16. Security and Validation

-   Protect admin routes with Clerk.
-   Verify administrator identity inside every protected Convex
    operation.
-   Validate all mutation inputs with Convex validators.
-   Validate image types and reasonable file sizes.
-   Keep secret keys in environment variables.
-   Never expose Clerk secret keys or privileged Convex credentials to
    the browser.
-   Do not trust cart/localStorage values.
-   Revalidate product publication, price, and size availability before
    generating an order message.
-   Prevent unauthorized settings changes.
-   Do not expose enquiry data publicly.
-   Sanitize or safely render user-provided text.
-   Add abuse protection to any public mutation endpoint if one is
    introduced.

The public storefront should not require sign-in.

------------------------------------------------------------------------

## 17. Environment Variables and Setup

Create `.env.example` with placeholders only. Never commit actual
secrets.

Include the environment variables required by the current Clerk and
Convex integration, such as:

``` env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Add any additional Clerk / Convex variables required
# by the selected current integration and deployment setup.
```

Follow the current official Clerk + Convex integration instructions for
the selected versions. Do not copy obsolete provider setup from old
tutorials.

Document:

-   Creating a Convex project.
-   Configuring Clerk.
-   Connecting Clerk and Convex.
-   Setting up the first administrator.
-   Running the development environment.
-   Deploying to Vercel.
-   Configuring production environment variables.
-   Adding the production domain.

------------------------------------------------------------------------

## 18. Suggested Project Structure

Adapt to the repository and current Next.js conventions. Keep the
structure feature-oriented and avoid unnecessary abstraction.

``` text
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── enquiries/
│   │   └── settings/
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── storefront/
│   ├── products/
│   ├── cart/
│   └── admin/
│
├── features/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── whatsapp/
│   └── enquiries/
│
├── hooks/
├── lib/
│   ├── utils.ts
│   ├── currency.ts
│   ├── whatsapp.ts
│   └── constants.ts
└── types/

convex/
├── schema.ts
├── auth.ts
├── products.ts
├── categories.ts
├── enquiries.ts
├── settings.ts
├── users.ts
└── lib/

public/
├── logo/
├── icons/
└── images/
```

Do not force this exact folder structure if a simpler structure better
fits the repository. Keep route components small and move reusable logic
into appropriate modules.

------------------------------------------------------------------------

## 19. Implementation Phases

### Phase 1 --- Foundation

-   Inspect repository.
-   Initialize or configure Next.js App Router.
-   Configure strict TypeScript.
-   Configure Tailwind CSS v4.
-   Configure shadcn/ui.
-   Install required dependencies.
-   Configure Convex.
-   Configure Clerk.
-   Establish environment variable documentation.
-   Create shared application layouts.
-   Establish brand design tokens.

**Deliverable:** Working application foundation.

### Phase 2 --- Data and Authorization

-   Implement Convex schema.
-   Implement product queries and mutations.
-   Implement category queries and mutations.
-   Implement settings.
-   Implement administrator verification.
-   Implement image upload and storage.
-   Test authorization.

**Deliverable:** Secure, functional backend.

### Phase 3 --- Public Storefront

-   Build responsive navigation.
-   Build homepage.
-   Build product catalogue.
-   Build category filters.
-   Build product cards.
-   Build product details and image gallery.
-   Build loading, empty, and error states.
-   Implement search and sorting.

**Deliverable:** Functional public catalogue.

### Phase 4 --- Shopping Selection and WhatsApp

-   Implement typed selection state.
-   Implement local persistence.
-   Implement product and size validation.
-   Implement quantity controls.
-   Implement selection summary.
-   Implement current-price revalidation.
-   Implement WhatsApp message generation.
-   Implement direct WhatsApp contact.
-   Implement product sharing.

**Deliverable:** Complete WhatsApp-powered shopping journey.

### Phase 5 --- Administration Dashboard

-   Implement protected dashboard layout.
-   Implement overview.
-   Implement product CRUD.
-   Implement image management.
-   Implement size availability.
-   Implement category management.
-   Implement settings.
-   Implement manual enquiry tracking.

**Deliverable:** Owner-managed storefront.

### Phase 6 --- Reactive Updates

-   Connect storefront components to Convex subscriptions.
-   Test product creation and publication.
-   Test price updates.
-   Test image updates.
-   Test category changes.
-   Test size availability changes.
-   Test store settings changes.
-   Verify updates in a second browser session without reload or
    redeployment.

**Deliverable:** Live storefront updates.

### Phase 7 --- PWA and SEO

-   Implement manifest.
-   Prepare app icons.
-   Implement service worker and offline fallback.
-   Test installation on supported devices.
-   Implement metadata.
-   Implement sitemap and robots.
-   Implement structured data.
-   Test social sharing previews.

**Deliverable:** Installable and discoverable storefront.

### Phase 8 --- Quality Assurance and Deployment

-   Test mobile, tablet, and desktop layouts.
-   Test all selection and WhatsApp scenarios.
-   Test stale price and sold-out size handling.
-   Test admin authorization.
-   Test image uploads.
-   Test reactive updates.
-   Test PWA installation.
-   Test SEO output.
-   Run linting, type checking, and production build.
-   Resolve errors and accessibility issues.
-   Deploy to Vercel.
-   Document production setup.

**Deliverable:** Production-ready application.

------------------------------------------------------------------------

## 20. Acceptance Criteria

The MVP is complete only when all of the following work:

### Storefront

-   [ ] Customers can browse published products.
-   [ ] Customers can browse men's and women's categories.
-   [ ] Customers can search and filter products.
-   [ ] Customers can view individual product pages.
-   [ ] Customers can inspect product images.
-   [ ] Customers can select an available size.
-   [ ] Sold-out sizes cannot be selected.
-   [ ] Customers can set quantities.
-   [ ] Customers can add multiple products to a selection.
-   [ ] Customers can edit and remove selection items.
-   [ ] Selection persists across navigation and refresh.
-   [ ] Current prices and availability are revalidated.
-   [ ] Customers can generate a complete WhatsApp message.
-   [ ] Customers can start a direct WhatsApp conversation.
-   [ ] Customers can share product URLs.

### Dashboard

-   [ ] Administrator can sign in.
-   [ ] Unauthorized users cannot access admin functions.
-   [ ] Administrator can create and edit products.
-   [ ] Administrator can manage product images.
-   [ ] Administrator can configure sizes.
-   [ ] Administrator can mark sizes available or sold out.
-   [ ] Administrator can publish and unpublish products.
-   [ ] Administrator can manage categories.
-   [ ] Administrator can update store settings.
-   [ ] Administrator can record and manage enquiries.

### Architecture and delivery

-   [ ] Storefront catalogue uses live Convex data.
-   [ ] Dashboard changes appear without full-page refresh.
-   [ ] Product updates do not require Vercel redeployment.
-   [ ] PWA is installable on supported browsers.
-   [ ] Offline fallback works.
-   [ ] Dynamic catalogue data is not treated as permanently fresh
    offline.
-   [ ] SEO metadata and sitemap work.
-   [ ] TypeScript has no avoidable unsafe types.
-   [ ] Lint, type check, and production build pass.

------------------------------------------------------------------------

## 21. Explicitly Out of Scope for MVP

Do not implement unless requested later:

-   Online payments.
-   Customer registration and accounts.
-   Automated WhatsApp Business API.
-   Automatic WhatsApp conversation import.
-   Automated order confirmation.
-   Delivery tracking.
-   Stock quantity management.
-   Discount codes.
-   Loyalty points.
-   Customer reviews.
-   Multi-vendor marketplace.
-   Multi-branch inventory.
-   Complex analytics or revenue reporting.

These can be introduced in later versions without compromising the
initial architecture.

------------------------------------------------------------------------

## 22. Final Product Principle

The customer journey must be:

**Discover → Select Size → Choose Quantity → Review Selection → WhatsApp
→ Confirm**

The storefront should communicate the quality and craftsmanship of
Sagacious Footies through its photography, typography, visual
consistency, and simplicity.

The administrator should be able to maintain the catalogue without
developer assistance.

**Build a premium artisan footwear shopping experience with the
simplicity of a WhatsApp conversation.**
