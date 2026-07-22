# ExclusInsider Admin — Firestore Data Contract

Every module writes to `projects/exclusinsider/...` on the shared Firebase
project (see `src/lib/firebase.js`). The public ExclusInsider site
(`C:\Users\Saim\Desktop\Web\New folder\exclusive\exclusinsider`) reads these
exact paths/fields via a `lib/firestoreRest.js` + `lib/content.js` fetch
layer, merging admin data over the bundled `data/*.json` fallback
(`lib/mergeContent.js`) — modeled directly on `src/projects/dealnbook/`
(see `dealnbook/CONTRACT.md`), which itself follows `src/projects/offerhoppr/`.

**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins (per-field merge, not
per-document — a partially-filled admin record still fills in missing
fields from JSON).

Conventions (copy `src/projects/dealnbook/modules/*` exactly):
- `const PROJECT_ID = "exclusinsider";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "exclusinsider/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores paired `image`/`imagePath` (or `url`/`imagePath`) fields.
- Pages: `"use client"`, gray/white theme identical to dealnbook's admin
  pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `Field`/`inputClass`/
  `textareaClass` helpers. The `home` module reuses the
  `SectionFrame`/`SettingsCard`/`CollectionManager` shared components pattern
  from `src/projects/dealnbook/modules/home/components/HomeAdminShared.jsx`
  (copy that file into `exclusinsider/modules/home/components/` and adapt).
  Every other module puts its settings form + list table + add/edit modal on
  ONE page (route key `""`).

---

## site-settings
- Doc `settings/site`: `{ name, legalName, tagline, description, founded, clearanceIssued, url, email, phone, addressLine1, addressLine2, hours, social:{instagram,linkedin,x,youtube}, keywords:[string] }`
  (matches `data/site.json` exactly — no renamed fields.)

## navbar
- Doc `navbar/settings`: `{ ctaLabel, ctaHref }`
- Collection `navbarPrimary`: `{ label, href, megaMenu(bool), order, active }`
  (Services mega-menu stays derived entirely from the `services` module on
  the frontend — same de-duplication precedent as dealnbook/offerhoppr.)

## footer
- Footer has no dedicated JSON file today — `site.json` + `services.json`
  drive it, plus two arrays currently hardcoded in `Footer.jsx`.
- Doc `footer/settings`: `{ newsletterHeading, newsletterPlaceholder, newsletterCtaLabel, copyrightSuffix }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
  (promotes `Footer.jsx` lines 14-20's hardcoded array)
- Collection `footerResources`: `{ label, href, order, active }`
  (promotes `Footer.jsx` lines 21-26's hardcoded array)
  (Footer's services column stays derived from the `services` module.)

## home (one page, one card per section — 10 sections total)
- Doc `home/hero`: `{ eyebrow, headline, subcopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref }`
  + Collection `homeHeroCredentials`: `{ text, order, active }` (the `credentials[]` string array)
- Doc `home/trustedLogos`: `{ eyebrow, heading }`
  + Collection `homeTrustedLogos`: `{ name, logo(url), order, active }`
- Doc `home/stats`: `{ eyebrow, heading }`
  + Collection `homeStats`: `{ value(number), suffix, label, order, active }`
- Doc `home/about`: `{ eyebrow, image(url), heading, body, ctaLabel, ctaHref }`
  + Collection `homeAboutPoints`: `{ text, order, active }` (the `points[]` string array)
- Doc `home/whyChooseUs`: `{ eyebrow, heading }`
  + Collection `homeWhyItems`: `{ title, description, order, active }`
- Doc `home/teamPreview`: `{ eyebrow, heading }`
- Doc `home/testimonialsIntro`: `{ eyebrow, heading }`
- Doc `home/faqIntro`: `{ eyebrow, heading }`
- Doc `home/latestBlogs`: `{ eyebrow, heading }`
- Doc `home/newsletter`: `{ eyebrow, heading, body, ctaLabel }`
- Doc `home/contactCta`: `{ eyebrow, heading, body, ctaLabel }`

## services (settings + collection CRUD)
- Collection `services`: `{ slug, title, shortDescription, icon, dossierNumber, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[string], workflow:[{step,description}], technologies:[string], pricingCta:{eyebrow,headline,body,ctaLabel}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (No separate `services/settings` doc — `/services` page hero is currently hardcoded in `app/services/page.jsx`; promote it into a `services/settings` doc `{ heroHeadline, heroSubcopy }` if/when that page's PageHero is wired to CMS.)

## team (settings + collection CRUD)
- Doc `team/settings`: `{ heroHeadline, heroSubcopy }` (promotes `/team` PageHero currently hardcoded in `app/team/page.jsx`)
- Collection `team`: `{ slug, name, role, image(url), imagePath, initials, bio, focus:[string], quote, order, active }`

## blog (settings + collection CRUD)
- Doc `blog/settings`: `{ heroHeadline, heroSubcopy }` (promotes `/blog` PageHero)
- Collection `blogArticles`: `{ slug, title, image(url), imagePath, category, date(ISO), author, readTime, excerpt, tags:[string], content:[string], order, active }`

## testimonials (collection CRUD)
- Collection `testimonials`: `{ quote, name, title, result, order, active }`
  (Field is `title`, not `role`/`company` — matches `data/testimonials.json` exactly.)

## faq (collection CRUD, sitewide)
- Collection `faqs`: `{ question, answer, order, active }`

## about-us (settings docs + 1 collection, one page)
- Doc `about/hero`: `{ heading, subheading }` (promotes hardcoded PageHero copy from `app/about/page.jsx`)
- Collection `aboutValues`: `{ title, description, order, active }` (promotes the `values[]` array in `app/about/page.jsx` lines 46-67)
- Doc `about/story`: `{ eyebrowStory, headingStory, eyebrowJourney, headingJourney }` (promotes the hardcoded headings in `AboutStory.jsx`)
  + Collection `aboutTimeline`: `{ year, title, description, image(url), imagePath, order, active }` (promotes `AboutStory.jsx` lines 75-123 `timeline[]`)
  + Collection `aboutStats`: `{ value, label, order, active }` (promotes `AboutStory.jsx` `stats[]`)

## contact-us (settings doc)
- Doc `contact/settings`: `{ eyebrow, heading, subcopy, nameLabel, emailLabel, companyLabel, budgetLabel, budgetOptions:[string], serviceLabel, messageLabel, directLineHeading, directLineBody }`
  + Collection `contactOffices`: `{ city, address, order, active }`

## policy (single doc, inline sections array)
- Doc `legal/privacy`: `{ title, sections:[{title,body}] }`
  (`{siteEmail}`/`{siteAddress}` interpolated client-side from `getSite()`/`getContact()` if referenced, not stored per-section — matches current hardcoded behavior in `app/privacy-policy/page.jsx`.)

## term-condition (single doc, inline sections array)
- Doc `legal/terms`: `{ title, sections:[{title,body}] }` (matches `app/terms-and-conditions/page.jsx`)

---

## Explicitly out of scope (mirrors dealnbook's precedent)
- **`data/portfolio.json`** — confirmed unused on the frontend (no page or
  component imports it). No `portfolio` admin module built unless the user
  asks for a Work/Portfolio page to be wired up.
- **`app/not-found.jsx`** — stays JSON/hardcoded-only, no Firestore module.
  A live network fetch on a render-boundary page defeats the point of an
  instant no-flash 404.
- **ContactForm / Newsletter submissions** — the admin panel's `contact-us`
  module manages the FORM'S LABELS/COPY only. Actual form submission
  handling (storing leads, sending email) is a separate feature not
  requested in this pass; forms remain client-side no-ops as they are today.
