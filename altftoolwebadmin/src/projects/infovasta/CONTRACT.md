# Infovasta Admin — Firestore Data Contract

Every module writes to `projects/infovasta/...` on the shared Firebase project
`altftool-bca36`. The public Infovasta site (`Infovasta/`, at
`C:\Users\Saim\Desktop\Web\New folder\infovsta\Infovasta`) reads these exact
paths/fields via `Infovasta/lib/firestoreRest.js` + `lib/content.js`, merging
admin data over the bundled `data/*.json` fallback (`lib/mergeContent.js`).
**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins.

**IMPORTANT — this schema was NOT designed for this build; `firestore.rules`
was already deployed for `projects/infovasta/...` ahead of any admin code**
(20 match blocks, unrelated prior work). Every module below targets those
already-live paths exactly — do not invent different collection/doc names.

Conventions (match `src/projects/samvatsara/modules/*`):
- `const PROJECT_ID = "infovasta";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` → write
  `setDoc(..., { merge: true })` with `updatedAt`, read merged over `DEFAULT_*`.
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "infovasta/<module>/<slot>" })` →
  stores paired `image`/`imageUrl` field + `imagePath`.
- Page: `"use client"`, gray/white theme, `emitAlert` (`@/lib/alertBus`),
  `DeleteConfirmModal` (`@/components/ui/DeleteConfirmModal`), shared
  `Field`/`inputClass`/`textareaClass` helpers, settings form + list table +
  add/edit modal all on ONE page (route key `""`).

**Settings-doc isolation rule**: every list page's hero/meta/detail template
copy lives in a SEPARATE `pages/{pageId}` collection (doc IDs: `service`,
`team`, `blog`, `portfolio`, `about`, `contact`) — NEVER inside the same
collection as that module's list items. `getCollection()` on the frontend has
no type filter, so a settings doc placed inside e.g. the `services` collection
would leak into the frontend as a fake service card. This is why the deployed
rules split `services`/`team`/`blogArticles`/`portfolio` (items) from `pages`
(per-route template copy) as entirely separate collections.

---

## site-settings
- Doc `settings/site`: `{ brand:{logoType(text|image),logoText,logoImage}, seo:{baseUrl,siteName,titleTemplate,description,favicon,ogImage,twitterCard,organizationName,sameAs:[string]} }`

## navbar
- Collection `navItems`: `{ href, label, order, active }`
  (flat nav array, no mega-menu — matches `data/nav.json`.)

## home (one page, singleton doc per section, all inside the `home` collection)
- Doc `home/hero`: `{ badges:[{icon,label}], headingBefore, headingHighlight, description, primaryCta:{label,href}, secondaryCta:{label,href}, image, imageAlt, marqueeLabel, marqueeLogos:[string] }`
- Doc `home/services`: `{ eyebrow, heading, ctaLabel, ctaHref }`
- Doc `home/whyChoose`: `{ eyebrow, headingBefore, headingHighlight }`
- Doc `home/team`: `{ eyebrow, headingBefore, headingHighlight, ctaLabel, ctaHref }`
- Doc `home/testimonials`: `{ eyebrow, headingBefore, headingHighlight }`
- Doc `home/newsletter`: `{ eyebrow, heading, placeholder, buttonLabel, bgImage, bannerImage, bannerAlt }`
- Doc `home/blog`: `{ eyebrow, headingBefore, headingHighlight, ctaLabel, ctaHref }`
- Doc `home/faq`: `{ eyebrow, headingBefore, headingHighlight, searchPlaceholder }`
- Doc `home/portfolio`: `{ eyebrow, headingBefore, headingHighlight, ctaLabel, ctaHref }` (new section — `data/home.json` had no `portfolio` key before this build; `components/Portfolio.jsx`'s previously-hardcoded home-preview heading/CTA now source from here)

## services (collection + separate pages doc)
- Collection `services`: `{ slug, title, shortDescription, description, icon(free-text Ionicons name), color(free-text "H, S%, L%" string), features:[string], techStack:[string], faq:[{q,a}], order, active }`
- Doc `pages/service`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, detail:{breadcrumb,quoteLabel,techHeading,whyHeading,whyText,processHeading,pricingHeadingPrefix,pricingText,pricingLabel,faqHeading,contactHeading,relatedHeading} }`

## why-choose-us (collection CRUD)
- Collection `whyChooseUs`: `{ title, icon, color, text, order, active }`

## process (collection CRUD)
- Collection `process`: `{ step, title, text, order, active }`
  (Note: `components/Process.jsx`'s standalone section heading is dead code — not rendered by any current page — so no `pages`/`home` doc backs it. If revived later, add a heading doc then.)

## team (collection + separate pages doc)
- Collection `team`: `{ slug, name, role, initials, color, image(=imageUrl), imagePath, experience, skills:[string], bio, socials:{twitter,linkedin,facebook}, order, active }`
- Doc `pages/team`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, detail:{breadcrumb,experienceSuffix,skillsHeading,backLabel} }`

## testimonials (collection CRUD)
- Collection `testimonials`: `{ name, company, initials, color, rating(1-5 number), review, order, active }`

## portfolio (collection + separate pages doc)
- Collection `portfolio`: `{ slug, title, client, industry, category, image(=imageUrl), imagePath, width(number), height(number), color, summary, challenge, solution, techUsed:[string], results:[{label,value}], order, active }`
- Doc `pages/portfolio`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, detail:{breadcrumb,challengeHeading,solutionHeading,techHeading,resultsHeading,ctaLabel,ctaHref,moreHeading} }`

## blog (collection + separate pages doc)
- Collection `blogArticles` (note: NOT `blog` — that name is reserved for the `home/blog` doc): `{ slug, large(bool), image(=imageUrl), imagePath, width(number), height(number), tag, category, tags:[string], author, readingTime, date(YYYY-MM-DD), title, excerpt, body:[string], order, active }`
- Doc `pages/blog`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, searchPlaceholder, emptyText, allLabel, detail:{backLabel,moreHeading} }`

## faq (collection CRUD, sitewide — distinct from each service's own embedded `faq` array)
- Collection `faqs`: `{ q, a, order, active }`

## about-us (doc + 3 collections + separate pages doc)
- Doc `about/main`: `{ mission, vision }`
- Collection `aboutStats`: `{ label, value(number), suffix, order, active }`
- Collection `aboutValues`: `{ title, icon, color, text, order, active }`
- Collection `aboutTimeline`: `{ year, title, text, order, active }`
- Doc `pages/about`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, story:{eyebrow,heading,image,imageAlt,paragraphs:[string]}, missionLabel, missionIcon, visionLabel, visionIcon, valuesSection:{eyebrow,heading}, timelineSection:{eyebrow,heading}, cta:{heading,label,href} }`

## contact-us (doc + leads + separate pages doc)
- Doc `contact/settings`: `{ address, phone, email, hours, mapQuery, socials:[{icon,href}], formLabels:{name,email,subject,message,submitLabel,successHeading,successBody} }`
- Doc `pages/contact`: `{ meta:{title,description}, hero:{eyebrow,title,highlight,description}, infoLabels:{address,phone,email,hours}, mapTitle }`
- Collection `contactLeads` (anonymous validated create; admin read/manage): `{ name, email, subject, message, status(new), createdAt }` — note field is `subject`, not `topic`/`projectType` (matches the deployed rule's `hasOnly` list).
- Collection `newsletterEmails` (anonymous validated create; admin read/manage): `{ email, source, status(new), createdAt }`

## footer
- Doc `footer/settings`: `{ about:{heading,text}, socials:[{icon,href}], quickLinks:{heading,links:[{label,href}]}, servicesHeading, newsletter:{heading,text,placeholder,successText}, copyright, bottomLinks:[{label,href}] }`

---

## Explicitly out of scope
- **`components/Projects.jsx`** — dead/unused component (leftover from the original "Pixology" template this site was adapted from), not imported anywhere. No admin module.
- **`components/Process.jsx`'s standalone section heading** — not currently rendered by any page (only the `process.json` items array is consumed, via `app/service/[slug]/page.jsx`'s `.slice(0,4)`). No heading doc built; add one later if the component is wired into a page.
- Decorative icon/color choices (contact info-item icons, value-card colors, HSL swatches) are stored as free-text fields in their respective items (matching the site's existing per-item `icon`/`color` JSON fields) rather than being hardcoded — but the *mapping logic* of which icon renders for which info-item type on `/contact-us` stays in code, not data, matching the offerhoppr precedent of not data-driving pure design/icon-selection logic.
