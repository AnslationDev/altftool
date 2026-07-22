# Offerris Admin — Firestore Data Contract

Every module writes to `projects/offerris/...` on the shared Firebase
project (see `src/lib/firebase.js`). The public Offerris site
(`C:\Users\Saim\Desktop\Web\New folder\offerris\Offerris`) reads these exact
paths/fields via a `lib/firestoreRest.js` + `lib/content.js` fetch layer,
merging admin data over the bundled `data/*.json` fallback
(`lib/mergeContent.js`) — modeled directly on `src/projects/exclusinsider/`
(see `exclusinsider/CONTRACT.md`), which follows `dealnbook` → `offerhoppr`.

**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins (per-field merge, not
per-document). NOTE: the Offerris frontend's JSON shapes differ from
exclusinsider's (e.g. `headline`/`copy`/`highlights` instead of
`heading`/`body`/`points`; testimonials use `role`/`company`/`rating`), so
this contract mirrors Offerris's `data/*.json` exactly.

Conventions (copy `src/projects/exclusinsider/modules/*` exactly):
- `const PROJECT_ID = "offerris";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "offerris/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores the download `url` in the field.
- Pages: `"use client"`, gray/white admin theme identical to exclusinsider's
  pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `SettingsCard` /
  `CollectionManager` / `SectionFrame` from `modules/_shared/AdminSectionShared.jsx`
  (preview theme uses Offerris's neon violet/cyan-on-black tokens; preview only).

---

## site-settings (matches `data/site.json`)
- Doc `settings/site`: `{ name, logoText, tagline, description, url, email, phone, foundedYear(number), social:{twitter,instagram,linkedin,dribbble,youtube}, seo:{titleTemplate,defaultTitle,defaultDescription,keywords:[string]} }`

## navbar (matches `data/nav.json`)
- Doc `navbar/settings`: `{ ctaLabel, ctaHref }`
- Collection `navbarPrimary`: `{ label, href, megaMenu(bool), order, active }`
- Collection `navbarServicesMenu`: `{ slug, title, description, icon, order, active }`
  (Offerris's mega-menu copy lives in `nav.json.servicesMenu` with its own short
  descriptions — kept as its own collection instead of deriving from services.)

## footer (matches `data/footer.json` + `data/nav.json` footer arrays)
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, newsletterHeading, newsletterBody, newsletterPlaceholder, newsletterCtaLabel, newsletterSuccess, copyrightSuffix }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Footer's services column stays derived from the `services` module.)

## home (one page, one card per section — matches `data/home.json` + `data/pages.json` intros)
- Doc `home/hero`: `{ eyebrow, headline, subcopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, scrollLabel, stackItems:[string], cardValue, cardLabel, cardSub }`
- Doc `home/trustedLogos`: `{ label }`
  + Collection `homeTrustedLogos`: `{ name, order, active }` (marquee is text-only)
- Collection `homeStats`: `{ value(number), suffix, label, order, active }` (no intro doc — `home.json.stats` is a bare array)
- Doc `home/about`: `{ eyebrow, headline, copy, ctaLabel, ctaHref }`
  + Collection `homeAboutHighlights`: `{ text, order, active }` (the `highlights[]` string array)
- Doc `home/whyChooseUs`: `{ eyebrow, headline, subcopy }`
  + Collection `homeWhyItems`: `{ title, description, order, active }`
- Doc `home/servicesIntro`: `{ eyebrow, heading, subcopy }` (ServicesGrid heading, from `pages.json.services.grid*`)
- Doc `home/teamPreview`: `{ eyebrow, heading, subcopy, ctaLabel }` (from `pages.json.team.preview*`)
- Doc `home/testimonialsIntro`: `{ eyebrow, heading }` (from `pages.json.testimonials`)
- Doc `home/faqIntro`: `{ eyebrow, heading }` (from `pages.json.faq`)
- Doc `home/latestBlogs`: `{ eyebrow, heading, subcopy, ctaLabel }` (from `pages.json.blog.latest*`)
- Doc `home/newsletter`: `{ headline, subcopy, placeholder, cta }` (section currently commented out on home, still managed)
- Doc `home/contactCta`: `{ headline, subcopy, ctaLabel, ctaHref }`

## services (matches `data/services.json` + `data/pages.json.services`)
- Doc `services/settings`: `{ badgeSuffix, heroHeadline, heroSubcopy }` (the `/services` PageHero; badge renders as "{count} {badgeSuffix}")
- Collection `services`: `{ slug, title, image(url), shortDescription, icon, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[string], workflow:[{title,description}], technologies:[string], pricingCta:{headline,subcopy,ctaLabel,ctaHref}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (Workflow rows use `title`, NOT `step`. pricingCta uses `headline/subcopy/ctaLabel/ctaHref`, flattened from `pricingCta.cta.{label,href}` on read/write by the frontend content layer? NO — the frontend normalizes: remote `pricingCta:{headline,subcopy,ctaLabel,ctaHref}` is mapped to `{headline, subcopy, cta:{label,href}}` in `lib/content.js`.)

## team (matches `data/team.json` + `data/pages.json.team`)
- Doc `team/settings`: `{ badge, heroHeadline, heroSubcopy }`
- Collection `team`: `{ slug, name, role, department, image(url), bio, experience, skills:[string], social:{twitter,linkedin,github,dribbble,instagram}, order, active }`

## blog (matches `data/blogs.json` + `data/pages.json.blog`)
- Doc `blog/settings`: `{ badge, heroHeadline, heroSubcopy }`
- Collection `blogArticles`: `{ slug, title, image(url), excerpt, category, author(team slug), date(YYYY-MM-DD), readingTime, tags:[string], coverGradient, content:[string paragraphs], order, active }`

## testimonials (matches `data/testimonials.json` + `data/pages.json.testimonials`)
- Collection `testimonials`: `{ quote, name, role, company, rating(1-5 number), order, active }`
  (Section heading lives in home/testimonialsIntro.)

## faq (matches `data/faq.json`)
- Collection `faqs`: `{ question, answer, order, active }`
  (Section heading lives in home/faqIntro; FAQ list is sitewide.)

## about-us (matches `data/about.json`, one page)
- Doc `about/hero`: `{ badge, heading, image(url), imageAlt }`
- Collection `aboutStoryImages`: `{ image(url), alt, order, active }` (the 3-image collage)
- Doc `about/values`: `{ eyebrow, heading }`
  + Collection `aboutValues`: `{ title, description, order, active }`
- Doc `about/timeline`: `{ eyebrow, heading }`
  + Collection `aboutTimeline`: `{ year, title, description, order, active }`
- Doc `about/leadership`: `{ eyebrow, heading, ctaLabel }` (members derive from the team module, first 3)

## contact-us (matches `data/contact.json` + `data/pages.json.contact`)
- Doc `contact/settings`: `{ badge, heading, subcopy, officeName, addressLine1, addressLine2, country, email, phone, mapEmbedPlaceholder }`
- Collection `contactHours`: `{ days, hours, order, active }`
- Doc `contact/form`: `{ nameLabel, namePlaceholder, emailLabel, emailPlaceholder, companyLabel, companyPlaceholder, serviceLabel, budgetLabel, messageLabel, messagePlaceholder, submitLabel, successTitle, successBody, budgetOptions:[string], serviceOptions:[string] }`

## policy (single doc, inline sections array — matches `data/legal-privacy.json`)
- Doc `legal/privacy`: `{ title, lastUpdated, sections:[{title,body}] }`
  (`{siteEmail}`/`{siteName}` placeholders interpolated client-side from `getSite()`.)

## term-condition (single doc — matches `data/legal-terms.json`)
- Doc `legal/terms`: `{ title, lastUpdated, sections:[{title,body}] }`

---

## Explicitly out of scope (mirrors exclusinsider/dealnbook precedent)
- **`data/portfolio.json`** — unused on the frontend (no page or component
  imports it). No portfolio admin module until a Work page exists.
- **`app/not-found.jsx`** — stays hardcoded (instant no-flash 404).
- **ContactForm / Newsletter submissions** — the admin manages LABELS/COPY
  only; forms remain client-side no-ops as they are today.
- **`site.json.colors`** — design tokens, not content. Not admin-managed.
