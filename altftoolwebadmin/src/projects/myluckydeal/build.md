# My Lucky Deals — Admin Panel Specification (ALTFTool)

> **Version 1.0 · July 2026**
> Single source of truth for building the Admin Panel inside ALTFTool.
> Every piece of content on the frontend is driven by Firestore — once the panel
> writes data, **nothing on the website is hardcoded**.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Firebase Integration Flow](#2-firebase-integration-flow)
3. [Collections Overview & Relationships](#3-collections-overview--relationships)
4. [Firestore Schema (Data Models)](#4-firestore-schema-data-models)
5. [Admin Panel Modules](#5-admin-panel-modules)
6. [CRUD Operations & Conventions](#6-crud-operations--conventions)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [Validation Rules](#8-validation-rules)
9. [Media Management](#9-media-management)
10. [SEO Management](#10-seo-management)
11. [Settings Module](#11-settings-module)
12. [Firestore Security Rules](#12-firestore-security-rules)
13. [Build & Integration Checklist](#13-build--integration-checklist)

---

## 1. System Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  ALTFTool Admin      │  write  │      FIREBASE        │
│  Panel (this spec)   ├────────►│  Firestore + Storage │
│  Auth: Firebase Auth │         │  (source of truth)   │
└─────────────────────┘         └──────────┬───────────┘
                                            │ read-only
                                            ▼
                                ┌──────────────────────┐
                                │  Next.js Frontend    │
                                │  (My Lucky Deals)    │
                                │  services/content.js │
                                └──────────────────────┘
```

**Key principles**

- **Frontend is read-only.** It never writes to Firestore. All writes come from the Admin Panel.
- **Seed fallback.** The frontend ships with seed data (`src/data/seed.js`). The moment a
  Firestore collection contains ≥1 document, seed data for that collection is ignored.
  → To go live, migrate seed data into Firestore first (see §13).
- **Image priority.** Every record may carry an `imageUrl`. If present it always wins;
  otherwise the frontend falls back to a local file convention, then to vector art.
  Upload images via the panel → Firebase Storage → save the download URL in `imageUrl`.
- **Instant reflection.** The frontend fetches on page load. Any panel change is live on
  the next page view — no rebuild, no redeploy.
- **Settings are single documents** (`settings/{docId}`), not collections. The frontend
  merges partial settings docs over defaults, so saving only the fields you changed is safe.

---

## 2. Firebase Integration Flow

**Services used:** Firestore (content), Firebase Storage (media), Firebase Auth (panel users only — the public site has no login).

**Read path (frontend):** `services/content.js` → `readCollection(name, seed)` / `readDoc("settings", id, seed)` → renders.

**Write path (admin panel):**

1. Admin authenticates (Firebase Auth — email/password or Google, restricted by role, §7).
2. Panel form validates input (§8).
3. Images upload to Storage (§9) → `getDownloadURL()` → stored in the document.
4. Document written with `setDoc(..., { merge: true })` to `collectionName/docId`.
5. Panel writes audit metadata on every mutation:
   `updatedAt` (server timestamp), `updatedBy` (admin uid), `createdAt` on first write.

**Document IDs:** always use the entity `slug`/`id` as the Firestore document ID
(e.g. `deals/nike-air-max`). The frontend treats `id` and `slug` interchangeably for lookups.

---

## 3. Collections Overview & Relationships

| # | Collection / Doc | Purpose | Renders on |
|---|---|---|---|
| 1 | `deals` | Products/offers | Home, /deals, /deals/[id], category & store pages, search |
| 2 | `categories` | Category taxonomy | Sidebar, /categories, rails, filters |
| 3 | `stores` | Merchant partners | Top Stores widget, /stores, /stores/[slug] |
| 4 | `coupons` | Promo codes | /coupons, /coupons/[id], store & deal pages |
| 5 | `blogs` | Articles | /blog, /blog/[slug], Related Reading |
| 6 | `faqs` | Q&A | /faq |
| 7 | `hero` | Homepage hero slides | Homepage carousel |
| 8 | `ads` | Placement-based ads | 14 slots site-wide (see `ADS_PLACEMENTS.md`) |
| 9 | `featuredOffers` | Offer tiles | Homepage "Featured Offers" |
| 10 | `collections` | Trending collections | /categories "Trending Across Categories" |
| 11 | `settings/trendingSearches` | Search chips | Header search, sidebar widget |
| 12 | `settings/home` | Homepage section order/visibility | Homepage |
| 13 | `settings/site` | Site name/tagline | Global |
| 14 | `settings/ui` | Nav, trust strips, footer, widget copy | Global |
| 15 | `settings/seo` | Default meta/OG/analytics | Global (§10) |
| 16 | `adminUsers` | Panel users & roles | Panel only |
| 17 | `subscribers` | Newsletter emails | Written by frontend forms (future), read in panel |

**Relationships (by reference field, not Firestore refs):**

```
deals.category  ──►  categories.slug      (many-to-one)
deals.storeId   ──►  stores.slug          (many-to-one)
coupons.storeSlug ─► stores.slug          (many-to-one)
collections.categorySlug ─► categories.slug
blogs.tags[]    ──►  free-form, used for search/filter
ads.placement   ──►  fixed placement keys (ADS_PLACEMENTS.md)
```

**Referential integrity is the panel's job** (Firestore has no FK constraints):
- Category/store dropdowns in forms must list existing slugs only.
- Block deleting a category/store that still has deals/coupons referencing it
  (or offer cascade/reassign).

---

## 4. Firestore Schema (Data Models)

Types: `S` string · `N` number · `B` boolean · `S[]` string array · `M` map/object · `TS` timestamp.
All docs also carry audit fields: `createdAt TS`, `updatedAt TS`, `updatedBy S`.

### 4.1 `deals/{slug}`

| Field | Type | Req | Description / Validation |
|---|---|---|---|
| `slug` | S | ✅ | URL id, kebab-case, unique. Immutable after create |
| `title` | S | ✅ | 3–80 chars. Short product name ("Nike Air Max") |
| `subtitle` | S | — | ≤60 chars ("Men's Running Shoes") — shown under title on cards |
| `description` | S | ✅ | 20–200 chars. One-line summary |
| `about` | S[] | — | 1–4 paragraphs, "About this Product" section |
| `category` | S | ✅ | Must equal an existing `categories.slug` |
| `storeId` | S | ✅ | Must equal an existing `stores.slug` |
| `storeName` | S | ✅ | Denormalized store display name (auto-fill from store) |
| `price` | S | ✅ | Display string incl. currency: `"₹2,399"` |
| `originalPrice` | S | — | Strike-through price. Must be > price numerically |
| `discountLabel` | S | ✅ | Badge text: `"60% OFF"` or `"₹5,000 OFF"` |
| `discountPercent` | N | ✅ | 0–100. Used for sorting/stats |
| `rating` | N | ✅ | 0–5, one decimal |
| `reviews` | N | — | Review count |
| `imageUrl` | S | — | Storage URL. Fallback: `/images/deals/{slug}.png` |
| `imageKey` | S | — | Vector fallback key (see §9.3) |
| `url` | S | ✅ | Outbound merchant URL (https). Opens with `rel=sponsored` |
| `badges` | S[] | — | e.g. `["Trending"]`. `"Deal of the Day"` selects the homepage widget |
| `hot` | B | — | Shows in "Hot Right Now" (max 4 shown) |
| `featured` | B | — | Featured pools |
| `endsInHours` | N | — | Countdown seed for offer timers |
| `highlights` | S[] | — | 3–6 bullet points, "Key Highlights" |
| `specs` | M | — | Key→value spec table, e.g. `{ "Brand": "Nike" }` |
| `active` | B | — | Panel-level publish toggle (recommended addition) |

### 4.2 `categories/{slug}`

| Field | Type | Req | Description |
|---|---|---|---|
| `slug` | S | ✅ | kebab-case, unique, immutable |
| `name` | S | ✅ | 2–30 chars |
| `tagline` | S | ✅ | ≤50 chars, shows under name |
| `icon` | S | ✅ | Icon key: `electronics · fashion · home · beauty · gaming · travel · sports · books` |
| `accent` | S | ✅ | Tint: `indigo · violet · rose · pink · emerald · sky · amber · teal` |
| `subcategories` | S[] | — | Chip labels on the category page |

### 4.3 `stores/{slug}`

| Field | Type | Req | Description |
|---|---|---|---|
| `slug` | S | ✅ | unique, immutable |
| `name` | S | ✅ | Display name |
| `logo` / `logoUrl` | S | — | `logoUrl` (Storage URL) overrides built-in brand marks (amazon, flipkart, myntra, ajio, nykaa, apple have crafted SVG marks) |
| `discount` | S | ✅ | Headline: `"Up to 60% OFF"` |
| `url` | S | ✅ | Official store URL (https) |
| `rating` | N | ✅ | 0–5 |
| `category` | S | ✅ | Free label ("Marketplace", "Fashion") |
| `description` | S | ✅ | 40–160 chars |
| `featured` | B | — | Top Stores widget shows first 5 |

### 4.4 `coupons/{id}`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | S | ✅ | Short unique id (`amz150`) |
| `code` | S | ✅ | The coupon code, UPPERCASE, 4–20 chars |
| `store` | S | ✅ | Store display name (denormalized) |
| `storeSlug` | S | ✅ | Must equal existing `stores.slug` |
| `title` | S | ✅ | Benefit line: `"₹150 off orders above ₹1,499"` |
| `discountLabel` | S | ✅ | `"₹150 OFF"` |
| `terms` | S | ✅ | Conditions line |
| `expiry` | S | ✅ | Display string (`"Expires in 3 days"`) — or store `expiresAt TS` and let panel compute |
| `url` | S | ✅ | Store URL to open on reveal |
| `usageCount` | N | — | Social proof counter |
| `category` | S | — | Filter label |

### 4.5 `blogs/{slug}`

| Field | Type | Req | Description |
|---|---|---|---|
| `slug` | S | ✅ | unique, immutable |
| `title` | S | ✅ | 10–90 chars |
| `excerpt` | S | ✅ | 50–180 chars |
| `category` | S | ✅ | Editorial label ("Tech Guide", "Fitness"…) — drives blog category tiles |
| `author` | S | ✅ | Name |
| `authorRole` | S | — | e.g. "Senior Hardware Editor" |
| `date` | S | ✅ | `"June 24, 2026"` (parseable) — used for sorting |
| `readTime` | S | ✅ | `"5 min read"` |
| `views` | S | — | `"1.2k"` — drives Popular Posts |
| `tags` | S[] | ✅ | 1–4 tags, no `#` prefix |
| `coverImage` | S | — | Storage URL. Fallback `/images/blog/{slug}.jpg` (1600×900, 16:9) |
| `coverKey` | S | — | Vector fallback |
| `featured` | B | — | Featured hero card on /blog |
| `content` | S[] | ✅ | Flat block array: plain string = paragraph, `"## "` prefix = subheading, `"- "` prefix = bullet (consecutive bullets group into a list) |

> The `content` format is intentionally a plain string array so the panel can use a
> simple repeatable-textarea editor. A rich-text editor should serialize to this format.

### 4.6 `faqs/{id}`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | S | ✅ | `f1`, `f2`… |
| `question` | S | ✅ | 10–160 chars |
| `answer` | S | ✅ | 20–600 chars |
| `category` | S | ✅ | Group label ("General", "Coupons", "Deals") |
| `order` | N | — | Manual sort (recommended addition) |

### 4.7 `hero/{id}`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | S | ✅ | `slide-audio` etc. Image fallback `/images/hero/{id}.png` |
| `eyebrow` | S | ✅ | Small caption ("Limited time offer") |
| `title` | S | ✅ | Line 1 ("Unbeatable Deals") |
| `highlight` | S | ✅ | Line 2, gradient ("Just For You!") |
| `subtitle` | S | ✅ | Support line |
| `badge` | S | ✅ | Bold savings line prefix ("Up to 70% OFF") |
| `discount` | S | ✅ | Circular badge value ("70%") |
| `ctaLabel` / `ctaUrl` | S | ✅ | Primary button |
| `secondaryLabel` / `secondaryUrl` | S | — | Outline button |
| `imageUrl` | S | — | Transparent PNG product cluster (1400×1400) |
| `imageKey` | S | — | Vector fallback |
| `theme` | S | — | Glow tone: `indigo · violet · sky` |
| `order` | N | — | Slide order (recommended addition) |

### 4.8 `ads/{id}` — see **ADS_PLACEMENTS.md** for the 14 placement keys

| Field | Type | Req | Description |
|---|---|---|---|
| `placement` | S | ✅ | One of the fixed placement keys |
| `active` | B | ✅ | Toggle without deleting |
| `priority` | N | — | Lowest wins per placement (default 99) |
| `title` / `subtitle` / `cta` | S | ✅ | Copy |
| `url` | S | ✅ | Internal path or external https URL |
| `imageUrl` | S | — | Transparent PNG |
| `imageKey` | S | — | `gift · card · cloud` |
| `gradient` | S | — | `brand · sky · emerald` |
| `startsAt` / `endsAt` | TS | — | Schedule window (recommended addition; panel enforces via `active`) |

### 4.9 `featuredOffers/{id}`

| Field | Type | Req | Description |
|---|---|---|---|
| `title` | S | ✅ | "Bank Offers" |
| `description` | S | ✅ | ≤90 chars, 2 lines max |
| `icon` | S | ✅ | `card · emi · exchange · ticket` |
| `badge` | S | — | Small label |
| `cta` | S | ✅ | "Explore" |
| `url` | S | ✅ | Target path |

### 4.10 `collections/{id}` (Trending Collections)

| Field | Type | Req | Description |
|---|---|---|---|
| `title` | S | ✅ | "Wireless Earbuds" |
| `categoryName` | S | ✅ | Display label |
| `categorySlug` | S | ✅ | Existing category slug |
| `imageUrl` | S | — | Product image |
| `imageKey` | S | — | Vector fallback |
| `count` | N | ✅ | "24 deals" number |
| `href` | S | ✅ | Link (e.g. `/search?q=earbuds`) |

### 4.11 `settings/*` single documents — see §11.

### 4.12 `adminUsers/{uid}` (panel only)

| Field | Type | Req | Description |
|---|---|---|---|
| `email` | S | ✅ | Matches Firebase Auth user |
| `displayName` | S | ✅ | |
| `role` | S | ✅ | `superadmin · editor · writer · admanager · viewer` |
| `active` | B | ✅ | Disable access without deleting |
| `lastLoginAt` | TS | — | |

---

## 5. Admin Panel Modules

### 5.1 Dashboard
- KPI cards: total deals (active/hot/featured), stores, live coupons, published blogs, active ads.
- Quick actions: "Add Deal", "Add Coupon", "New Blog Post", "Manage Ads".
- Content health warnings: deals with missing images, expired coupons, ads with no image,
  broken references (deal pointing to deleted category/store).

### 5.2 Deals Manager
- Table: image thumb, title, category, store, price, discount %, hot/featured flags, status, updatedAt.
- Filters: category, store, hot, featured, badge. Search by title/slug.
- Form: all §4.1 fields. Category & store as dropdowns (from Firestore). Repeatable
  inputs for `about`, `highlights`; key/value editor for `specs`.
- "Deal of the Day" selector: exactly one deal should carry badge `"Deal of the Day"` —
  panel enforces uniqueness (removing it from the previous holder).
- Live preview card (render like frontend HotDealCard).

### 5.3 Categories Manager
- CRUD with icon & accent pickers (visual swatch grid from §4.2 enums).
- Subcategory chip editor.
- Delete guard: block if any deal references the slug.

### 5.4 Stores Manager
- CRUD; logo upload (square PNG) → `logoUrl`.
- Featured toggle (Top Stores widget shows first 5 featured).
- Delete guard: block if deals/coupons reference the slug.

### 5.5 Coupons Manager
- CRUD; code auto-uppercase; expiry picker; usage counter (read-only display).
- Bulk actions: deactivate expired, duplicate for new campaign.

### 5.6 Blog Manager
- List with cover thumb, category, author, date, views, featured flag.
- Editor: metadata panel + block editor that serializes to the `content` string-array
  format (paragraph / `## heading` / `- bullet`).
- Cover upload (enforce 16:9, min 1600×900, JPG).
- Exactly one `featured: true` post recommended (panel warning otherwise).

### 5.7 FAQ Manager
- CRUD + drag-to-reorder (writes `order`).

### 5.8 Hero Slides Manager
- CRUD, max 5 slides, drag-to-reorder, image upload (transparent PNG, 1400×1400).
- Live preview of the slide as rendered on the homepage.

### 5.9 Ads Manager
- Grouped by placement (dropdown of the 14 fixed keys with a location screenshot/hint).
- Active toggle, priority stepper, gradient picker, image upload.
- Empty-state note per placement: "No active ad — this slot renders nothing on the site."

### 5.10 Featured Offers & Collections Manager
- Simple CRUD grids for `featuredOffers` (4 recommended) and `collections` (5 recommended).

### 5.11 Media Library — §9.
### 5.12 SEO Manager — §10.
### 5.13 Settings — §11.
### 5.14 Users & Roles — §7.
### 5.15 Subscribers
- Read-only table of `subscribers` (email, source page, createdAt) + CSV export.

---

## 6. CRUD Operations & Conventions

| Operation | Convention |
|---|---|
| **Create** | Doc ID = slug/id (auto-generate kebab-case from title, editable before save, unique check via `getDoc`). Write full validated object + `createdAt`, `updatedAt`, `updatedBy`. |
| **Read** | List views use `getDocs(collection)`; big lists paginate with `orderBy + limit + startAfter`. |
| **Update** | `setDoc(..., { merge: true })` with changed fields + `updatedAt`, `updatedBy`. Never change the doc ID/slug — to rename, create new + delete old (offer "duplicate" action). |
| **Delete** | Soft-delete preferred (`active: false`) for deals/ads/coupons. Hard delete allowed for blogs/faqs/hero/offers after confirm. Always run reference guard (§3). |
| **Publish flow** | `active`/`featured`/`hot` booleans are the publish switches — no separate draft system needed (add `status: "draft"` later if required; frontend ignores unknown fields safely). |

---

## 7. User Roles & Permissions

Roles stored in `adminUsers/{uid}.role` and mirrored as Firebase Auth **custom claims**
(`role`) so Security Rules can enforce them server-side.

| Capability | superadmin | editor | writer | admanager | viewer |
|---|---|---|---|---|---|
| Dashboard view | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deals / Categories / Stores / Coupons CRUD | ✅ | ✅ | — | — | — |
| Blogs / FAQs CRUD | ✅ | ✅ | ✅ | — | — |
| Hero / Featured Offers / Collections | ✅ | ✅ | — | — | — |
| Ads CRUD | ✅ | ✅ | — | ✅ | — |
| Settings (site/ui/home/seo) | ✅ | — | — | — | — |
| Media upload | ✅ | ✅ | ✅ | ✅ | — |
| Media delete | ✅ | ✅ | — | — | — |
| Users & roles | ✅ | — | — | — | — |
| Subscribers export | ✅ | ✅ | — | — | — |

Panel UX: hide (don't just disable) modules the role can't access; rules enforce regardless (§12).

---

## 8. Validation Rules

**Global**
- Trim all strings; reject empty required fields.
- Slugs/ids: `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–60 chars, unique per collection, immutable.
- URLs: internal must start `/`; external must start `https://`.
- Enum fields (icon, accent, gradient, theme, placement, role) must match the fixed lists in §4.
- Numbers: `discountPercent` 0–100 · `rating` 0–5 (step 0.1) · `priority` ≥ 1 · counts ≥ 0.
- Reference fields (`category`, `storeId`, `storeSlug`, `categorySlug`) must resolve to an existing doc.

**Cross-field**
- `originalPrice` numeric value > `price` numeric value.
- `discountLabel` should be consistent with `discountPercent` (warn, don't block).
- Ad with `endsAt` in the past → force `active: false` on save.
- Blog `date` must parse with `Date.parse()`.

**Content quality (warnings)**
- Deal without image → "will use vector fallback".
- Blog content < 4 blocks → "article looks thin".
- More than 4 `hot` deals → "only 4 show on the homepage".

---

## 9. Media Management

### 9.1 Storage layout (Firebase Storage)

```
/media
  /deals/{slug}.png          transparent PNG, 1000×1000 (1:1)
  /hero/{id}.png             transparent PNG, 1400×1400 (1:1)
  /blog/{slug}.jpg           JPG q85+, 1600×900 (16:9), subject centred
  /ads/{id}.png              transparent PNG (banner ~1000×600, sidebar ~600×600)
  /stores/{slug}.png         square logo PNG, ≥256×256
  /misc/…                    anything else
```

### 9.2 Media Library module
- Grid browser per folder, upload (drag-drop), preview, copy-URL, delete (role-gated).
- On upload: validate type (png/jpg/webp), max 2 MB, minimum dimensions per folder (above);
  client-side compress/resize before upload.
- Every uploader in entity forms writes the resulting `getDownloadURL()` into the record's
  `imageUrl`/`logoUrl`/`coverImage` field — the frontend needs nothing else.

### 9.3 Fallback chain (already built into the frontend)
`imageUrl` (Storage) → local `/public/images/...` convention file → crafted vector art
(`imageKey`: `shoe · headphones · perfume · watch · laptop · keyboard · camera · chair ·
console · jeans · cooker · gift · cloud · card`).

---

## 10. SEO Management

New single doc **`settings/seo`** + per-entity fields.

**`settings/seo`**

| Field | Type | Description |
|---|---|---|
| `defaultTitle` | S | `"My Lucky Deals — Best Deals Online"` |
| `titleTemplate` | S | `"%s · My Lucky Deals"` |
| `defaultDescription` | S | ≤160 chars |
| `ogImageUrl` | S | 1200×630 social card |
| `twitterHandle` | S | `@myluckydeals` |
| `canonicalBase` | S | `https://myluckydeals.com` |
| `robots` | S | `index,follow` (kill-switch: `noindex`) |
| `analyticsId` | S | GA4 / other |

**Per-entity optional overrides** (add to deals, blogs, categories, stores):
`seoTitle S`, `seoDescription S`, `ogImageUrl S`, `noindex B`.
Frontend metadata generation should read: entity override → `settings/seo` default.
`sitemap.js` and `robots.js` already exist in the frontend and enumerate Firestore content.

Panel UX: SEO tab inside each entity form + a global SEO settings page with
Google-style search-result preview.

---

## 11. Settings Module

All are **single documents** under `settings/`. Partial saves are safe (frontend merges over defaults).

### `settings/site`
| Field | Type | Example |
|---|---|---|
| `name` | S | "My Lucky Deals" |
| `tagline` | S | "Your one-stop destination for the best deals online. Save more, shop smart." |
| `newsletterNote` | S | Subscribe blurb |

### `settings/trendingSearches`
| Field | Type | Example |
|---|---|---|
| `terms` | S[] | `["iPhone 15 Pro", "Nike Shoes", …]` (6–10 chips) |

### `settings/home`
| Field | Type | Description |
|---|---|---|
| `sections` | M[] | `[{ id, visible }]` — order + visibility of homepage sections (`hero, hot-deals, ad-inline, category-rail, featured-offers, …`) |
| `sidebarWidgets` | S[] | Right-rail order: `deal-of-day · top-stores · newsletter · trending-searches · sponsored-ad · refer-earn` |

### `settings/ui`
| Key | Shape | Controls |
|---|---|---|
| `nav` | `[{label, href}]` | Header + mobile menu links |
| `heroTrust` | `[{icon, title, note}]` ×4 | Trust strip under hero |
| `bottomTrust` | `[{icon, title, note}]` ×4 | Homepage bottom trust strip |
| `dealBenefits` | `[{icon, label}]` ×4 | Deal page benefit tiles |
| `referEarn` | `{title, text, cta, url}` | Refer & Earn widget |
| `newsletter` | `{title, note, placeholder, cta}` | Sidebar newsletter card |
| `footer` | `{tagline, links[], social[], payments[]}` | Footer content |

Icon keys available for trust/benefit items:
`shield · tag · headset · refresh · truck · lock · sparkles · store · clock · mail · gift · card · discount · fire · star`.

---

## 12. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin()      { return request.auth != null && request.auth.token.role in
                              ['superadmin','editor','writer','admanager']; }
    function hasRole(r)     { return request.auth != null && request.auth.token.role == r; }
    function contentEditor(){ return hasRole('superadmin') || hasRole('editor'); }

    // Public site: read-only everywhere
    match /{col}/{doc} {
      allow read: if true;
      allow write: if false;
    }

    match /deals/{id}          { allow write: if contentEditor(); }
    match /categories/{id}     { allow write: if contentEditor(); }
    match /stores/{id}         { allow write: if contentEditor(); }
    match /coupons/{id}        { allow write: if contentEditor(); }
    match /hero/{id}           { allow write: if contentEditor(); }
    match /featuredOffers/{id} { allow write: if contentEditor(); }
    match /collections/{id}    { allow write: if contentEditor(); }
    match /blogs/{id}          { allow write: if contentEditor() || hasRole('writer'); }
    match /faqs/{id}           { allow write: if contentEditor() || hasRole('writer'); }
    match /ads/{id}            { allow write: if contentEditor() || hasRole('admanager'); }
    match /settings/{id}       { allow write: if hasRole('superadmin'); }
    match /adminUsers/{uid}    { allow read, write: if hasRole('superadmin'); }
    match /subscribers/{id}    { allow create: if true;           // public newsletter form
                                 allow read: if contentEditor();
                                 allow update, delete: if hasRole('superadmin'); }
  }
}
```

Storage rules: public read on `/media/**`, write only for authenticated admins with an allowed role.

---

## 13. Build & Integration Checklist

1. Create Firebase project → enable Firestore, Storage, Auth (email/password).
2. Deploy Security Rules (§12) + Storage rules.
3. Create the first `superadmin` in Auth, set custom claim `role=superadmin`, add `adminUsers/{uid}`.
4. **Seed migration:** import every array from `src/data/seed.js` into its collection
   (doc ID = slug/id), and the four `UI_CONTENT`/`SITE`/`HOME_CONFIG`/`TRENDING_SEARCHES`
   objects into `settings/*`. From that moment the panel is the source of truth.
5. Build modules in this order: Auth/roles → Media Library → Deals → Categories/Stores →
   Coupons → Ads → Hero/Offers/Collections → Blogs/FAQs → Settings → SEO → Dashboard.
6. Point the frontend `.env.local` at the same Firebase project — content goes live instantly.
7. QA pass: create/edit/hide one record of every type in the panel and verify it on the site
   (homepage, listing page, detail page, ad slots, settings texts).