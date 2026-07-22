# Dealnbook Admin — Firestore Data Contract

Every module writes to `projects/dealnbook/...` on the shared Firebase project
`altftool-bca36` (same project every other tenant uses — see `src/lib/firebase.js`).
The public Dealnbook site (`dealnbook-frontend/`, folder at
`C:\Users\Saim\Desktop\Web\New folder\dealnbook\Dealnbok`) reads these exact
paths/fields via `lib/firestoreRest.js` + `lib/content.js`, merging admin data
over the bundled `data/*.json` fallback (`lib/mergeContent.js`) — modeled
directly on `src/projects/offerhoppr/` (see `offerhoppr/CONTRACT.md` and the
live reference frontend at `C:\Users\Saim\Desktop\Web\New folder\offerhopper\offerhopper`).
**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins.

Conventions (copy `src/projects/offerhoppr/modules/*` exactly):
- `const PROJECT_ID = "dealnbook";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "dealnbook/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores paired `url`/`imagePath` fields.
- Pages: `"use client"`, gray/white theme identical to offerhoppr's admin
  pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `Field`/`inputClass`/
  `textareaClass` helpers. The `home` module reuses the
  `SectionFrame`/`SettingsCard`/`CollectionManager` shared components pattern
  from `src/projects/offerhoppr/modules/home/components/HomeAdminShared.jsx`
  (copy that file into `dealnbook/modules/home/components/` and adapt).
  Every other module puts its settings form + list table + add/edit modal on
  ONE page (route key `""`).

---

## site-settings
- Doc `settings/site`: `{ name, shortName, tagline, logoText, logoMonogram, description, url, founded(number), seo:{titleTemplate,defaultTitle,description,keywords:[string]}, social:{instagram,linkedin,twitter,behance} }`

## navbar
- Doc `navbar/settings`: `{ logoType(text|image), logoText, logoImageUrl, imagePath, ctaLabel, ctaHref }`
- Collection `navbarPrimary`: `{ label, href, order, active }`
  (No services mega-menu collection — the header's services dropdown is
  derived entirely from the `services` module on the frontend, exactly like
  offerhoppr's footer already derives its services list. This removes the
  `nav.json.servicesMenu` duplication that exists in the current JSON.)

## footer
- Doc `footer/settings`: `{ newsletterHeading, newsletterPlaceholder, newsletterCtaLabel, copyrightSuffix, legalPrivacyLabel, legalTermsLabel }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Footer's services column stays derived from the `services` module, same as today.)

## home (one page, one card per section — 12 sections total)
- Doc `home/hero`: `{ eyebrow, headlineLines:[string], supportCopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, statValue, statSuffix, statLabel }`
  + Collection `homeVisualCards`: `{ image(url), alt, order, active }`
- Doc `home/trustedLogos`: `{ label }` + Collection `homeTrustedLogos`: `{ name, order, active }` (plain text names, no logo images — matches current `data/home.json`)
- Collection `homeStats`: `{ value(number), suffix, label, order, active }`
- Doc `home/about`: `{ eyebrow, heading, headingHighlight, body, imageSrc, imageAlt, ctaLabel, ctaHref }`
  + Collection `homeAboutPoints`: `{ title, description, icon, order, active }`
- Doc `home/servicesIntro`: `{ eyebrow, heading, body }`
- Doc `home/whyChooseUs`: `{ eyebrow, heading, body, hint }`
  + Collection `homeWhyItems`: `{ title, description, icon, tag, order, active }`
- Doc `home/teamPreview`: `{ eyebrow, heading, body, ctaLabel, ctaHref }`
- Doc `home/testimonialsIntro`: `{ eyebrow, heading }`
- Doc `home/faqIntro`: `{ eyebrow, heading }`
- Doc `home/blogIntro`: `{ eyebrow, heading, ctaLabel, ctaHref }`
- Doc `home/newsletter`: `{ eyebrow, heading, body, placeholder, ctaLabel }`
- Doc `home/contactCta`: `{ eyebrow, heading, body, ctaLabel, ctaHref }`

## services (settings + collection CRUD)
- Doc `services/settings`: `{ heroHeadline, heroSubcopy, heroImage(url) }`
  (`heroImage` promotes the pngtree URL currently hardcoded in `app/services/page.jsx`.)
- Collection `services`: `{ slug, title, icon, shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[{title,description}], workflow:[{title,description}], technologies:[string], pricingCtaHeading, pricingCtaBody, pricingCtaLabel, pricingCtaHref, faq:[{question,answer}], relatedSlugs:[string], order, active }`

## team (settings + collection CRUD)
- Doc `team/settings`: `{ heroHeadline, heroSubcopy }`
- Collection `team`: `{ slug, name, role, department, image(url), imagePath, bio, experience, skills:[string], social:{linkedin,instagram,twitter,behance}, order, active }`

## blog (settings + collection CRUD)
- Doc `blog/settings`: `{ heroHeadline, heroSubcopy }`
- Collection `blogArticles`: `{ slug, title, image(url), imagePath, category, excerpt, author, date(ISO), readingTime, tags:[string], coverGradient, content:[string], order, active }`

## testimonials (collection CRUD)
- Collection `testimonials`: `{ quote, name, role, company, rating(1-5 number), order, active }`
  (Field is `name`, not `author` — matches `data/testimonials.json`.)

## faq (collection CRUD, sitewide — distinct from per-service faq embedded in `services`)
- Collection `faqs`: `{ question, answer, order, active }`

## about-us (settings docs + 1 collection, one page)
- Doc `about/hero`: `{ eyebrow, heading, imageUrl }`
  (Promotes the hardcoded hero copy + hardcoded gstatic image URL out of `app/about/page.jsx`.)
- Doc `about/philosophy`: `{ quote }`
- Collection `aboutPrinciples`: `{ title, description, order, active }` (the 4-item `PRINCIPLES` array)

## contact-us (settings doc)
- Doc `contact/settings`: `{ heroHeadline, heroSubcopy, officeName, addressLines:[string], phone, email, businessHours:[{days,hours}], mapEmbedPlaceholder, social:{instagram,linkedin,twitter,behance}, departments:[{label,email}] }`

## policy (single doc, inline sections array)
- Doc `legal/privacy`: `{ title, effectiveDate, sections:[{title,body}] }`
  (`{siteEmail}`/`{siteAddress}` interpolated client-side from `getSite()`/`getContact()`, not stored per-section — matches current hardcoded behavior.)

## term-condition (single doc, inline sections array)
- Doc `legal/terms`: `{ title, effectiveDate, sections:[{title,body}] }`

---

## Explicitly out of scope (mirrors offerhoppr's precedent)
- **`data/portfolio.json`** — confirmed dead/unused on the frontend (no page or component imports it). No `portfolio` admin module was built.
- **404 page (`not-found.jsx`)** — stays JSON-only, no Firestore module. A live network fetch on a render-boundary page defeats the point of an instant no-flash 404.
