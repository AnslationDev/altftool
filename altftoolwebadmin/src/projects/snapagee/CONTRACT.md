# Snapagee Admin — Firestore Data Contract

Every module writes to `projects/snapagee/...` on the shared Firebase project
(see `src/lib/firebase.js`). The public Snapagee site
(`C:\Users\Saim\Desktop\Web\New folder\snapagee\snapagee`) reads these exact
paths/fields via a `lib/firestoreRest.js` + `lib/content.js` fetch layer,
merging admin data over the bundled `data/*.json` fallback
(`lib/mergeContent.js`) — modeled directly on `src/projects/thestylelife/`
(see `thestylelife/CONTRACT.md`), which follows shophobia → offerris →
exclusinsider → dealnbook.

**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins (per-field merge, not
per-document). NOTE: Snapagee's JSON shapes differ from TheStyleLife's:
- site `social` is a fixed set of 4 known platforms (twitter/linkedin/instagram/dribbble),
  each rendered by a specific icon component — kept as 4 plain fields on the
  site-settings doc, NOT a generic `{label,href}` collection like other tenants.
- site `founded` is a STRING (e.g. `"2019"`), not a number.
- the navbar CTA button (Header + mobile drawer) reads `site.ctaPrimaryLabel`
  directly — there is no separate navbar-level CTA doc, unlike other tenants.
- home has TWO independent stats blocks: the hero's 4 stats (`homeHeroStats`)
  and the standalone Stats section's 4 stats (`homeStats`) — do not merge them.
- home `trustedLogos` are real logo images `{src,alt}` (not brand-name text).
- home `whyChooseUs` items carry `imageUrl` (not `image` — kept exactly as the
  frontend component already expects, so no JSX prop-name changes are needed).
  The bento-grid layout hardcodes visual treatment per index assuming exactly
  4 active items — admins should keep exactly 4 active reasons.
- `home.json`'s top-level `newsletter` field is **dead data** — no component
  reads it (Footer's newsletter blurb is a separate, independently-hardcoded
  block, wired below under `footer`). Left alone, not part of this contract.
- Home-page section intros (Services grid, Team preview, Testimonials) are
  hardcoded `<SectionHeading>` props inside each component today — NOT in
  `home.json`. They become new `home/*Intro` docs here (mirrors precedent).
  There is no FAQ or Latest-Blogs section on Snapagee's home page (Snapagee's
  home doesn't render either), so no `faqIntro`/`latestBlogs` docs exist.
- Services/Team/Blog each have their OWN list-page heading fields on their
  `settings` doc, independent from home's `*Intro` docs, even though the
  services copy is identical today — mirrors precedent of NOT collapsing
  duplicated copy into one shared field.
- Service detail pages repeat 5 shared section headings (Benefits/Included/
  Process/Tools label/FAQ/Related) sourced from `services/settings` — new
  fields, not in `services.json` today.
- Team detail page's CTA button ("Start a Project") does NOT reuse
  `site.ctaPrimaryLabel` today (it's independently hardcoded) — kept as its
  own field on `team/settings` to preserve exact current behavior.
- Blog posts have no `relatedSlugs` field — related posts are computed by
  category match in the component (kept as-is, not part of this contract).
- Contact reasons/budget/project-type lists are plain STRING arrays — kept as
  `list` fields on `contact/settings`, alongside form field labels not in
  `contact.json` today (labels are hardcoded JSX literals in `ContactForm.jsx`).
- Policy/Terms pages are entirely hardcoded `SECTIONS` constants today — no
  `data/legal-privacy.json` / `data/legal-terms.json` exist yet. This
  contract's `policy`/`term-condition` sections are entirely new fields; the
  frontend gets two new JSON fallback files seeded from the current hardcoded
  copy.

Conventions (copy `src/projects/thestylelife/modules/*` exactly):
- `const PROJECT_ID = "snapagee";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` (`src/lib/firestoreCrud.js`).
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "snapagee/<module>/<slot>" })`
  (`src/lib/storageUpload.js`) → stores the download `url` in the field.
- Pages: `"use client"`, gray/white admin theme identical to every other
  tenant's pages, `emitAlert` (`@/lib/alertBus`), `DeleteConfirmModal`
  (`@/components/ui/DeleteConfirmModal`), shared `SettingsCard` /
  `CollectionManager` / `SectionFrame` from `modules/_shared/AdminSectionShared.jsx`
  (preview theme uses Snapagee's actual ink/paper/indigo/lime tokens from the
  site's `app/globals.css`; preview only, not a real style dependency).
- Legal docs (`policy`, `term-condition`) use the bespoke ordered
  section-repeater `LegalDocPage` (copied from thestylelife's `policy/page.jsx`),
  not the generic `SettingsCard`.

---

## site-settings (matches `data/site.json`)
- Doc `settings/site`: `{ name, tagline, description, url, email, phone, address, founded(string), twitter, linkedin, instagram, dribbble, ctaPrimaryLabel, ctaSecondaryLabel }`

## navbar (matches `data/nav.json.primary`)
- Collection `navbarPrimary`: `{ label, href, megaMenu(boolean), order, active }`
  (Header's Services mega-dropdown derives from the `services` module directly; `megaMenu` only controls whether a dropdown chevron/panel opens under that item.)

## footer (matches `data/nav.json.footerQuickLinks` + new footer settings)
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, newsletterHeading, newsletterBlurb, copyrightSuffix }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
  (Footer's "Services" column stays derived from the `services` module directly — no separate collection.)

## home (one page, one card per section — matches `data/home.json`)
- Doc `home/hero`: `{ badge, headline, subcopy, primaryCtaLabel, secondaryCtaLabel }` (button hrefs stay hardcoded routes `/contact`, `/services`; no hero image on Snapagee)
  + Collection `homeHeroStats`: `{ label, value(number), suffix, order, active }` (the 4 stats under the hero copy)
- Doc `home/trustedLogos`: `{ heading }` (the marquee's caption line, e.g. "Trusted by teams that ship fast")
  + Collection `homeTrustedLogos`: `{ src(image url), alt, order, active }`
- Collection `homeStats`: `{ label, value(number), suffix, order, active }` (the standalone Stats section — independent from `homeHeroStats`)
- Doc `home/about`: `{ eyebrow, heading, body }`
  + Collection `homeAboutPoints`: `{ text, order, active }`
- Doc `home/whyChooseUs`: `{ eyebrow, heading, description }`
  + Collection `homeWhyReasons`: `{ title, description, imageUrl(url), order, active }` (keep exactly 4 active for the bento layout)
- Doc `home/servicesIntro`: `{ eyebrow, heading, description }` (ServicesGrid heading)
- Doc `home/teamPreview`: `{ eyebrow, heading, description, ctaLabel }` ("Meet everyone")
- Doc `home/testimonialsIntro`: `{ eyebrow, heading, description }`
- Doc `home/contactCta`: `{ heading, subheading, buttonLabel }` (matches `home.json.contactCta` exactly, no eyebrow)

## services (matches `data/services.json`)
- Doc `services/settings`: `{ pageEyebrow, pageHeading, pageDescription, listFaqEyebrow, listFaqHeading, listFaqDescription, benefitsEyebrow, benefitsHeading, featuresEyebrow, featuresHeading, workflowEyebrow, workflowHeading, stackLabel, faqEyebrow, faqHeading, relatedEyebrow, relatedHeading }`
  (`pageEyebrow/pageHeading/pageDescription` + `listFaq*` = the `/services` index page's own header + FAQ block; the rest repeat on every `/services/[slug]` detail page)
- Collection `services`: `{ slug, icon, title, image(url), shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[{title,description}], workflow:[{step,title,description}], technologies:[string], pricingCta:{title,description,buttonLabel}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (icon keys the frontend's `ServiceIcon` map understands: web-design, mobile-app, seo, email-marketing, social-media, custom-web-app, wordpress, ui-ux — any other value silently falls back to web-design)

## team (matches `data/team.json`)
- Doc `team/settings`: `{ pageHeading, pageDescription, relatedEyebrow, relatedHeading, detailCtaLabel }` (`detailCtaLabel` = the member-detail page's "Start a Project" button, independent from site CTA)
- Collection `team`: `{ slug, name, image(url), role, bio, longBio, focus:[string], initials, order, active }`

## blog (matches `data/blogs.json`)
- Doc `blog/settings`: `{ pageEyebrow, pageHeading, pageDescription, relatedEyebrow, relatedHeading }`
- Collection `blogArticles`: `{ slug, image(url), title, excerpt, category, date(YYYY-MM-DD), readTime, author, content:[string paragraphs], order, active }`

## testimonials (matches `data/testimonials.json`)
- Collection `testimonials`: `{ quote, name, role, company, order, active }`

## faq (matches `data/faq.json`)
- Collection `faqs`: `{ question, answer, order, active }` (shared by both `/contact` and `/services`, as today)

## contact-us (matches `data/contact.json`; form field labels are hardcoded in `ContactForm.jsx` today)
- Doc `contact/settings`: `{ heading, subheading, pageEyebrow, emailCardLabel, phoneCardLabel, officesCardLabel, faqEyebrow, faqHeading, nameLabel, emailLabel, companyLabel, budgetLabel, projectTypeLabel, detailsLabel, submitLabel, successTitle, successBody, projectTypes:[string](list), budgetRanges:[string](list) }`
- Collection `contactOffices`: `{ city, address, order, active }`

## policy (single doc — matches new `data/legal-privacy.json`)
- Doc `legal/privacy`: `{ title, subcopy, sections:[{title,body}] }`
  (`subcopy` is the PageHeader description line under the title; `{siteEmail}` placeholder interpolated client-side from `getSite()`.)

## term-condition (single doc — matches new `data/legal-terms.json`)
- Doc `legal/terms`: `{ title, subcopy, sections:[{title,body}] }`

---

## Explicitly out of scope (mirrors thestylelife/shophobia precedent)
- **`data/portfolio.json`** — unused on the frontend (no page or component imports it). No portfolio admin module.
- **`app/not-found.jsx`** — stays hardcoded (instant no-flash 404).
- **ContactForm / Footer newsletter submissions** — the admin manages labels/copy only; both forms remain client-side no-ops as they are today.
- **Micro UI chrome** ("Explore Service", "Back to top", "Open/Close menu", accordion chevrons, form placeholders, `←`/`→` back-links) — stays hardcoded, matching precedent.
- **`home.json`'s top-level `newsletter` field** — dead data, not read by any component, not wired.
