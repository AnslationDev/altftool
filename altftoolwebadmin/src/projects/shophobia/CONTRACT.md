# Shophobia Admin — Firestore Data Contract

Every module writes to `projects/shophobia/...` on the shared Firebase
project (see `src/lib/firebase.js`). The public Shophobia site
(`C:\Users\Saim\Desktop\Web\New folder\shophobia\shophobia`) reads these exact
paths/fields via a `lib/firestoreRest.js` + `lib/content.js` fetch layer,
merging admin data over the bundled `data/*.json` fallback
(`lib/mergeContent.js`) — modeled directly on `src/projects/offerris/`
(see `offerris/CONTRACT.md`), which follows exclusinsider → dealnbook.

**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins (per-field merge, not
per-document). NOTE: Shophobia's JSON shapes differ from Offerris's:
- home hero has a `glitchWord` (must appear inside `headline` to glitch-style it)
- services `features` are `[{title, description}]` objects (not strings)
- services `workflow` rows keep a display `step` ("01"…) besides title/description
- services `pricingCta` is `{title, subtitle, buttonLabel}` (href is always /contact)
- team members use `expertise[]` + `longBio`; blog posts use `readTime` + `author` (name string)
- `site.json.social` is an ARRAY of `{name, handle, url}` (kept as an array field)
- site-level `stats[]` render on home but live in `site.json` → managed as the
  `siteStats` collection inside the site-settings module

Conventions (copy `src/projects/offerris/modules/*` exactly):
- `const PROJECT_ID = "shophobia";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "shophobia/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores the download `url` in the field.
- Pages: `"use client"`, gray/white admin theme identical to offerris's
  pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `SettingsCard` /
  `CollectionManager` / `SectionFrame` from `modules/_shared/AdminSectionShared.jsx`
  (preview theme uses Shophobia's pink/violet/cyan-on-void tokens; preview only).

---

## site-settings (matches `data/site.json`)
- Doc `settings/site`: `{ name, legalName, tagline, description, url, email, phone, address, founded, social:[{name,handle,url}], seo:{keywords:[string]} }`
- Collection `siteStats`: `{ label, value(number), suffix, order, active }`
  (rendered by the home page's Stats strip; `site.json.stats` is the fallback)

## navbar (matches `data/nav.json`)
- Doc `navbar/settings`: `{ ctaLabel, ctaHref, megaMenuFooterText, megaMenuFooterCtaLabel }`
- Collection `navbarPrimary`: `{ label, href, megaMenu(bool), order, active }`
  (The services mega-menu content derives from the `services` module — no
  separate menu collection, matching the frontend which maps services.json.)

## footer (matches `data/footer.json` + `data/nav.json` footer arrays)
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, newsletterHeading, newsletterBlurb, copyrightSuffix }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Footer's services column stays derived from the `services` module. The
  newsletter copy in the footer form comes from `home/newsletter`.)

## home (one page, one card per section — matches `data/home.json`)
- Doc `home/hero`: `{ eyebrow, headline, glitchWord, subcopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, scrollLabel }`
- Doc `home/trustedLogos`: `{ heading }`
  + Collection `homeTrustedLogos`: `{ name, logo(image url), order, active }`
- Doc `home/about`: `{ eyebrow, heading, body, ctaLabel, ctaHref, image(url), imageAlt, sinceLabel, sinceYear }`
  + Collection `homeAboutHighlights`: `{ text, order, active }`
- Doc `home/whyChooseUs`: `{ eyebrow, heading, subcopy, ctaLabel }`
  + Collection `homeWhyItems`: `{ title, description, order, active }`
- Doc `home/servicesIntro`: `{ eyebrow, heading, description }` (ServicesGrid heading)
- Doc `home/teamPreview`: `{ eyebrow, heading, description, ctaLabel }`
- Doc `home/testimonialsIntro`: `{ eyebrow, heading }`
- Doc `home/faqIntro`: `{ eyebrow, heading }`
- Doc `home/latestBlogs`: `{ eyebrow, heading, description, ctaLabel }`
- Doc `home/newsletter`: `{ heading, subcopy, placeholder, buttonLabel, successMessage }`
- Doc `home/contactCta`: `{ heading, subcopy, buttonLabel }` (section currently commented out on home, still used on every other page)

## services (matches `data/services.json` + `data/pages.json.services`)
- Doc `services/settings`: `{ badge, heroHeadline, heroSubcopy, benefitsEyebrow, benefitsHeading, featuresEyebrow, featuresHeading, workflowEyebrow, workflowHeading, stackEyebrow, stackHeading, faqEyebrow, faqHeading, relatedEyebrow, relatedHeading, heroPrimaryCtaLabel, heroSecondaryCtaLabel }`
  (the `/services` PageHero + the shared section headings on every detail page)
- Collection `services`: `{ slug, title, image(url), icon, shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[{title,description}], workflow:[{step,title,description}], technologies:[string], pricingCta:{title,subtitle,buttonLabel}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (icon keys the frontend understands: globe, device, signal, mail, spark, cube, layers, prism)

## team (matches `data/team.json` + `data/pages.json.team`)
- Doc `team/settings`: `{ badge, heroHeadline, heroSubcopy, relatedHeading, relatedAllCtaLabel, relatedWorkCtaLabel }`
- Collection `team`: `{ slug, name, role, image(url), bio, longBio, expertise:[string], social:{linkedin,x,instagram}, order, active }`

## blog (matches `data/blogs.json` + `data/pages.json.blog`)
- Doc `blog/settings`: `{ badge, heroHeadline, heroSubcopy, relatedHeading }`
- Collection `blogArticles`: `{ slug, title, category, image(url), excerpt, date(YYYY-MM-DD), readTime, author, content:[string paragraphs], order, active }`

## testimonials (matches `data/testimonials.json`)
- Collection `testimonials`: `{ name, role, quote, rating(1-5 number), order, active }`
  (Section heading lives in home/testimonialsIntro.)

## faq (matches `data/faq.json`)
- Collection `faqs`: `{ question, answer, order, active }`
  (Section heading lives in home/faqIntro; FAQ list is sitewide.)

## about-us (matches `data/about.json`, one page; story copy derives from home/about)
- Doc `about/hero`: `{ badge, heading, intro }` — `intro` supports a `{founded}`
  placeholder interpolated from site settings; the paragraph renders as
  "{site.description} {intro}".
- Doc `about/values`: `{ eyebrow, heading, description }`
  + Collection `aboutValues`: `{ title, description, image(url), order, active }`
- Doc `about/teamSection`: `{ eyebrow, heading }` (members derive from the team module)

## contact-us (matches `data/contact.json` + `data/pages.json.contact`)
- Doc `contact/settings`: `{ badge, heading, subcopy, email, phone, address, hours, emailLabel, phoneLabel, addressLabel, hoursLabel }`
- Doc `contact/form`: `{ nameLabel, namePlaceholder, emailLabel, emailPlaceholder, companyLabel, companyPlaceholder, serviceLabel, budgetLabel, messageLabel, messagePlaceholder, submitLabel, successTitle, successBody, budgetRanges:[string], serviceOptions:[string] }`

## policy (single doc, inline sections array — matches `data/legal-privacy.json`)
- Doc `legal/privacy`: `{ title, lastUpdated, sections:[{title,body}] }`
  (`{siteEmail}`/`{siteName}` placeholders interpolated client-side from `getSite()`.)

## term-condition (single doc — matches `data/legal-terms.json`)
- Doc `legal/terms`: `{ title, lastUpdated, sections:[{title,body}] }`

---

## Explicitly out of scope (mirrors offerris/dealnbook precedent)
- **`data/portfolio.json`** — unused on the frontend (no page or component
  imports it). No portfolio admin module until a Work page exists.
- **`app/not-found.jsx`** — stays hardcoded (instant no-flash 404).
- **ContactForm / Newsletter submissions** — the admin manages LABELS/COPY
  only; forms remain client-side no-ops as they are today.
- **Micro UI chrome** ("Read Article", "View Service", "Back To Blog",
  aria-labels, "Skip to content") — stays hardcoded, matching precedent.
