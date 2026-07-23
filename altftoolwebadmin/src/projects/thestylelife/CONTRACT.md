# TheStyleLife Admin — Firestore Data Contract

Every module writes to `projects/thestylelife/...` on the shared Firebase
project (see `src/lib/firebase.js`). The public TheStyleLife site
(`C:\Users\Saim\Desktop\Web\New folder\thestyle\thestylelife`) reads these exact
paths/fields via a `lib/firestoreRest.js` + `lib/content.js` fetch layer,
merging admin data over the bundled `data/*.json` fallback
(`lib/mergeContent.js`) — modeled directly on `src/projects/shophobia/`
(see `shophobia/CONTRACT.md`), which follows offerris → exclusinsider → dealnbook.

**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins (per-field merge, not
per-document). NOTE: TheStyleLife's JSON shapes differ from Shophobia's:
- home hero has NO glitch word and NO scroll label — plain `headline`/`subcopy`
- home `trustedLogos` are plain brand-name STRINGS (no logo image, no per-item doc)
- home `stats` live in the **home** module (not site-settings) — `homeStats` collection
- home `whyChooseUs` reasons carry an `image` each (illustration, not a photo)
- `site.json.social` is `[{label, href}]` (not `{name,handle,url}`) — managed as `siteSocial` collection
- `site.json.foundedYear` is a NUMBER, no separate `founded` string
- services `pricingCta` is `{title, description, ctaLabel}` (not `subtitle`/`buttonLabel`)
- team members use `focus[]` (not `expertise[]`) and `social:[{label,href}]` (an array, not a fixed map)
- contact reasons are plain STRINGS (not a separate `contact/form` doc) — kept as a `list` field
  on `contact/settings`, alongside a few extra form-label fields not in `contact.json` today
  (the form's field labels are currently hardcoded JSX literals in `ContactForm.jsx`)
- Home-page section intros (Services grid, Team preview, Testimonials, FAQ, Latest Blogs)
  are currently hardcoded `<SectionHeading>` props inside each component — NOT in `home.json`
  today. They become new `home/*Intro` docs here (mirrors Shophobia's precedent) and new
  keys added to `data/home.json` as the JSON fallback.
- About page (`AboutHero.jsx` + the hardcoded `timeline`/`values` arrays in `app/about/page.jsx`)
  is entirely hardcoded today — no `data/about.json` exists yet. This contract's `about-us`
  section is entirely new fields; the frontend gets a new `data/about.json` fallback file.
- Footer's `quickLinks`/`resources` arrays and newsletter blurb are hardcoded in `Footer.jsx`
  today — no `data/footer.json` exists yet. New fallback file, same as about-us.
- Legal pages' `sections` arrays are hardcoded in each page file today — new
  `data/legal-privacy.json` / `data/legal-terms.json` fallback files.

Conventions (copy `src/projects/shophobia/modules/*` exactly):
- `const PROJECT_ID = "thestylelife";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "thestylelife/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores the download `url` in the field.
- Pages: `"use client"`, gray/white admin theme identical to shophobia/offerris's
  pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `SettingsCard` /
  `CollectionManager` / `SectionFrame` from `modules/_shared/AdminSectionShared.jsx`
  (preview theme uses TheStyleLife's paper/ink/coral tokens; preview only).

---

## site-settings (matches `data/site.json`)
- Doc `settings/site`: `{ name, legalName, tagline, description, url, email, phone, address, foundedYear(number), keywords:[string] }`
- Collection `siteSocial`: `{ label, href, order, active }` (matches `site.json.social`)

## navbar (matches `data/nav.json`)
- Doc `navbar/settings`: `{ ctaLabel, ctaHref }`
- Collection `navbarPrimary`: `{ label, href, order, active }`
  (Header's Services mega-dropdown derives from the `services` module directly — no menu flag needed.)

## footer (matches new `data/footer.json` + `services` module)
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, resourcesHeading, newsletterHeading, newsletterBlurb, copyrightSuffix }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Footer's services column stays derived from the `services` module.)

## home (one page, one card per section — matches `data/home.json`)
- Doc `home/hero`: `{ eyebrow, headline, subcopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, image }`
- Doc `home/trustedLogos`: `{ heading }` (the marquee's caption line)
  + Collection `homeTrustedLogos`: `{ name, order, active }` (plain brand-name text, no image)
- Collection `homeStats`: `{ label, value(number), suffix, order, active }`
- Doc `home/about`: `{ eyebrow, image, headline, body, ctaLabel, ctaHref }`
  + Collection `homeAboutPoints`: `{ text, order, active }`
- Doc `home/whyChooseUs`: `{ eyebrow, headline }`
  + Collection `homeWhyReasons`: `{ title, description, image(url), order, active }`
- Doc `home/servicesIntro`: `{ eyebrow, heading, description, ctaLabel }` (ServicesGrid heading + "View All Services")
- Doc `home/teamPreview`: `{ eyebrow, heading, description, ctaLabel }` ("Meet the Full Team")
- Doc `home/testimonialsIntro`: `{ eyebrow, heading, description }`
- Doc `home/faqIntro`: `{ eyebrow, heading, description }`
- Doc `home/latestBlogs`: `{ eyebrow, heading, description, ctaLabel }` ("Read the Blog")
- Doc `home/newsletter`: `{ eyebrow, headline, body, ctaLabel }` (cta is a plain button label, not a link)
- Doc `home/contactCta`: `{ eyebrow, headline, body, ctaLabel, ctaHref }`

## services (matches `data/services.json`)
- Doc `services/settings`: `{ badge, heroHeadline, heroSubcopy, heroImage(url), heroPrimaryCtaLabel, heroSecondaryCtaLabel, detailHeroCtaLabel, benefitsEyebrow, benefitsHeading, featuresEyebrow, featuresHeading, workflowEyebrow, workflowHeading, stackEyebrow, stackHeading, faqEyebrow, faqHeading, relatedEyebrow, relatedHeading }`
  (`/services` index hero fields + the shared section headings repeated on every `/services/[slug]` detail page)
- Collection `services`: `{ slug, title, image(url), icon, shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[{title,description}], workflow:[{step,title,description}], technologies:[string], pricingCta:{title,description,ctaLabel}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (icon keys the frontend's `SERVICE_ICONS` map understands: web, mobile, seo, email, social, webapp, wordpress, uiux)

## team (matches `data/team.json`)
- Doc `team/settings`: `{ badge, heroHeadline, heroSubcopy, relatedEyebrow, relatedHeading, relatedCtaLabel }`
- Collection `team`: `{ slug, name, role, image(url), bio, longBio, focus:[string], quote, social:[{label,href}], order, active }`

## blog (matches `data/blogs.json`)
- Doc `blog/settings`: `{ badge, heroHeadline, heroSubcopy, relatedEyebrow, relatedHeading }`
- Collection `blogArticles`: `{ slug, title, category, image(url), excerpt, date(YYYY-MM-DD), readTime, author, content:[string paragraphs], order, active }`

## testimonials (matches `data/testimonials.json`)
- Collection `testimonials`: `{ name, role, quote, rating(1-5 number), order, active }`

## faq (matches `data/faq.json`)
- Collection `faqs`: `{ question, answer, order, active }`

## about-us (matches new `data/about.json`; About page hero/timeline/values are hardcoded today)
- Doc `about/hero`: `{ badge, heading, subcopy, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, image1(url), image2(url), image3(url), sinceBadgeText }`
  + Collection `aboutHeroStats`: `{ value, label, order, active }` (the 3 stats under the hero copy)
- Doc `about/timeline`: `{ eyebrow, heading, body }`
  + Collection `aboutTimeline`: `{ year, title, detail, order, active }`
- Doc `about/values`: `{ eyebrow, heading, body, image1(url), image2(url) }` (the two illustration photos beside the value cards)
  + Collection `aboutValues`: `{ title, description, order, active }`

## contact-us (matches `data/contact.json`; form field labels are hardcoded in `ContactForm.jsx` today)
- Doc `contact/settings`: `{ heading, subheading, email, phone, address, hours, reasons:[string], nameLabel, emailLabel, reasonLabel, messageLabel, submitLabel, successTitle, successBody }`

## policy (single doc — matches new `data/legal-privacy.json`)
- Doc `legal/privacy`: `{ title, subcopy, sections:[{title,body}] }`
  (`subcopy` is the PageHero line under the title, e.g. "Last updated July 1, 2026. ..."; `{siteEmail}` placeholder interpolated client-side from `getSite()`.)

## term-condition (single doc — matches new `data/legal-terms.json`)
- Doc `legal/terms`: `{ title, subcopy, sections:[{title,body}] }`

---

## Explicitly out of scope (mirrors shophobia/offerris precedent)
- **`data/portfolio.json`** — unused on the frontend (no page or component imports it). No portfolio admin module until a Work page exists.
- **`app/not-found.jsx`** — stays hardcoded (instant no-flash 404).
- **ContactForm / Newsletter submissions** — the admin manages labels/copy only; forms remain client-side no-ops as they are today.
- **The About page's "View Our Work" button** links to `/work`, a page that does not exist today — preserved as-is (not this effort's concern to fix).
- **Micro UI chrome** ("Explore", "Read More →", "View Profile →", "Book an intro call", aria-labels) — stays hardcoded, matching precedent.
