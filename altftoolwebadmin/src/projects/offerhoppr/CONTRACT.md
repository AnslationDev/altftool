# Offerhoppr Admin — Firestore Data Contract

Every module writes to `projects/offerhoppr/...` on the shared Firebase project
`altftool-bca36`. The public OfferHoppr site (`offerhopper/`, folder spelled
with the correct double-"e" brand spelling — the admin project id intentionally
stays `offerhoppr` for continuity with the pre-existing stub) reads these exact
paths/fields via `offerhopper/lib/firestoreRest.js` + `lib/content.js`, merging
admin data over the bundled `data/*.json` fallback (`lib/mergeContent.js`).
**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins.

Conventions (match `src/projects/samvatsara/modules/*`):
- `const PROJECT_ID = "offerhoppr";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` → write
  `setDoc(..., { merge: true })` with `updatedAt`, read merged over `DEFAULT_*`.
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "offerhoppr/<module>/<slot>" })` →
  stores paired `url`/`image` field + `imagePath`; frontend reads that URL field.
- Page: `"use client"`, gray/white theme, `emitAlert` (`@/lib/alertBus`),
  `DeleteConfirmModal` (`@/components/ui/DeleteConfirmModal`), shared
  `Field`/`inputClass`/`textareaClass` helpers, settings form + list table +
  add/edit modal all on ONE page (route key `""`).

---

## site-settings
- Doc `settings/site`: `{ name, tagline, description, url, email, phone, address, social:{instagram,twitter,linkedin,tiktok,youtube}, founded(number), ctaPrimary, ctaSecondary }`

## navbar
- Doc `navbar/settings`: `{ logoType(text|image), logoText, logoImageUrl, logoImagePath, mobileCtaLabel }`
  (`mobileCtaLabel` is an optional override — when blank the frontend falls back to `site.ctaPrimary`, fixing the previous hardcoded "Grab the Deal" mobile-menu string.)
- Collection `navbarPrimary`: `{ label, href, order, active }`
  (No mega-menu/services picker here — the header's services dropdown is driven entirely by the `services` module.)

## footer
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, resourcesHeading, newsletterHeading, newsletterPlaceholder, newsletterCtaLabel, copyrightSuffix }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Quick-links column reuses `navbarPrimary`/`nav.json.footerQuickLinks` — no separate collection.)

## home (one page, card per section)
- Doc `home/hero`: `{ eyebrow, headline, subcopy, stickers:[string], ctaPrimary, ctaSecondary }`
- Doc `home/trustedLogos`: `{}` (no editable fields) + Collection `homeTrustedLogos`: `{ name, logo(url), order, active }`
- Collection `homeStats`: `{ value(number), suffix, label, order, active }`
- Doc `home/about`: `{ eyebrow, headline, body, highlights:[string] }`
- Doc `home/whyChooseUs`: `{ eyebrow, headline }` + Collection `homeWhyReasons`: `{ title, description, order, active }`
- Doc `home/newsletter`: `{ headline, subcopy }`
- Doc `home/contactCta`: `{ headline, subcopy, buttonLabel }`

## services (settings + collection CRUD)
- Doc `services/settings`: `{ heroHeadline, heroSubcopy, ctaHeadline, ctaSubcopy, ctaButtonLabel }`
- Collection `services`: `{ slug, title, icon(globe|phone|search|mail|megaphone|layers|wordpress|palette), shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[{title,description}], workflow:[{step,description}], technologies:[string], pricingCta:{headline,subcopy,buttonLabel}, faq:[{question,answer}], relatedSlugs:[string], order, active }`

## team (settings + collection CRUD)
- Doc `team/settings`: `{ heroHeadline, heroSubcopy }`
- Collection `team`: `{ slug, name, role, experience, image(url), imagePath, bio, specialties:[string], social:{linkedin,twitter}, order, active }`

## blog (settings + collection CRUD)
- Doc `blog/settings`: `{ heroHeadline, heroSubcopy }`
- Collection `blogArticles`: `{ slug, title, image(url), imagePath, category(free text), excerpt, author(free text), date(YYYY-MM-DD), readTime, content:[string], order, active }`

## testimonials (collection CRUD)
- Collection `testimonials`: `{ quote, author, role, rating(1-5 number), order, active }`

## faq (collection CRUD, sitewide — distinct from per-service faq embedded in `services`)
- Collection `faqs`: `{ question, answer, order, active }`

## about-us (settings docs + 2 collections, one page)
- Doc `about/hero`: `{ badge, headline }`
- Doc `about/story`: `{ badge, headline, paragraphs:[string] }`
- Doc `about/storyImage`: `{ url, alt, stickerTopLeft, stickerBottomRight, heading, body }`
- Doc `about/values`: `{ eyebrow, headline }` + Collection `aboutValues`: `{ title, description, order, active }`
- Doc `about/timelineHeading`: `{ eyebrow, headline }` + Collection `aboutTimeline`: `{ year, title, description, order, active }`
- Doc `about/closing`: `{ headline, buttonLabel, buttonHref }`

## contact-us (settings doc + leads)
- Doc `contact/settings`: `{ headline, subcopy, topics:[string], budgetRanges:[string], officeHours, responseTime }`
- Collection `contactLeads` (anonymous create, admin read/manage): `{ name, email, topic, budget, message, status(new), createdAt }`
- Collection `newsletterEmails` (anonymous create, admin read/manage): `{ email, source, status(new), createdAt }`

## policy (single doc, inline sections array)
- Doc `policy/privacy`: `{ badge, title, effectiveDate, sections:[{title,body}] }`
  (`{siteEmail}` is interpolated client-side from `getSite()`, not stored per-section.)

## term-condition (single doc, inline sections array)
- Doc `terms/terms`: `{ badge, title, effectiveDate, sections:[{title,body}] }`

## misc-pages (2 singleton docs, one page)
- Doc `misc/notFound`: `{ digits, sticker, heading, body, buttonLabel, buttonHref, secondaryLabel, secondaryHref }`
- Doc `misc/loading`: `{ message }`
- **Scope exception:** the live frontend's `not-found.jsx`/`loading.jsx` intentionally read ONLY the bundled `data/misc.json` fallback, never Firestore — these are special Next.js render-boundary pages where a live network fetch would defeat their purpose (instant render / no-flash 404). This admin module exists so content is editable and future-proofed, but is not yet wired into the live frontend fetch path.

---

## Explicitly out of scope
- **`data/portfolio.json`** — confirmed dead/unused on the frontend (not imported by any page or component). No `portfolio` admin module was built. If a portfolio/case-studies page is added to the frontend later, that's a new feature request, not part of this data-wiring task.
