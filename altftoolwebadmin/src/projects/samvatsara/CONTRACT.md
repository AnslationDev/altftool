# Samvatsara Admin — Firestore Data Contract

Every module writes to `projects/samvatsara/...` on the shared Firebase project
`altftool-bca36`. The public Samvatsara site (`SamvatSara/`) reads these exact
paths/fields via `SamvatSara/lib/firestoreRest.js` + `lib/content.js`, merging
admin data over the bundled `data/*.json` fallback (`lib/mergeContent.js`).
**Field names below are authoritative — do not rename them.** When the admin
leaves a value null/empty, the JSON fallback wins.

Conventions (match `src/projects/dailyhnt/modules/*`):
- `const PROJECT_ID = "samvatsara";`
- Singleton docs via `createSingletonDocService([...PATH], DEFAULT)` → write
  `setDoc(..., { merge: true })` with `updatedAt`, read merged over `DEFAULT_*`.
- Collections via `createCollectionCrudService([...PATH], { normalize, orderByField })`
  — every doc carries numeric `order` + boolean `active` (default true via `!== false`).
- Images: `createImageUploader({ pathPrefix: "samvatsara/<module>/<slot>" })` →
  stores paired `imageUrl` + `imagePath`; frontend reads `imageUrl` (also accepts `image`/`src`).
- Page: `"use client"`, gray/white theme, `emitAlert` (`@/lib/alertBus`),
  `DeleteConfirmModal` (`@/components/ui/DeleteConfirmModal`), shared
  `Field`/`inputClass`/`textareaClass`, settings form + list table + add/edit
  modal all on ONE page (route key `""`).

---

## site-settings
- Doc `settings/site`: `{ name, logoText, logoSuffix, tagline, shortDescription, foundedYear(number), seo:{ titleTemplate, defaultTitle, description, keywords[], siteUrl }, social:{ instagram, linkedin, twitter, dribbble, pinterest } }`

## navbar
- Doc `navbar/settings`: `{ logoType(text|image), logoText, logoImageUrl, logoImagePath, cta:{ label, href } }`
- Collection `navbarPrimary`: `{ label, href, hasMega(bool), order, active }`
- Collection `navbarServices` (mega-menu): `{ slug, title, description, icon, order, active }`
  (icon ∈ web, app, seo, email, social, webapp, wordpress, uiux)

## footer
- Doc `footer/settings`: `{ quickLinksHeading, servicesHeading, resourcesHeading, newsletterHeading, copyrightText }`
- Collection `footerResources`: `{ label, href, order, active }`
  (Quick-links column = navbarPrimary; Services column = navbarServices.)

## home (one page, card per section)
- Doc `home/hero`: `{ eyebrow, headlineLead, headlineItalic, subcopy, ctaPrimary:{label,href}, ctaSecondary:{label,href}, scrollLabel, imageUrl, imagePath }`
- Doc `home/trustedLogos`: `{ label }` + Collection `homeTrustedLogos`: `{ name, order, active }`
- Collection `homeStats`: `{ value(number), suffix, label, order, active }`
- Doc `home/aboutTeaser`: `{ eyebrow, heading, headingItalic, body, points[](string[]), cta:{label,href}, quote, quoteAuthor }`
- Doc `home/whyChooseUs`: `{ eyebrow, heading, headingItalic }` + Collection `homeWhyReasons`: `{ title, description, icon, order, active }` (icon ∈ hand, compass, house, heart)
- Doc `home/servicesPreview`: `{ eyebrow, heading, headingItalic, body }`
- Doc `home/teamPreview`: `{ eyebrow, heading, headingItalic, body, ctaLabel }`
- Doc `home/testimonialsPreview`: `{ eyebrow, heading, headingItalic }`
- Doc `home/faqPreview`: `{ eyebrow, heading, headingItalic }`
- Doc `home/blogPreview`: `{ eyebrow, heading, headingItalic, ctaLabel }`
- Doc `home/cta`: `{ eyebrow, heading, headingItalic, body, ctaPrimary:{label,href}, ctaSecondary:{label,href} }`
- Doc `home/newsletter`: `{ heading, body, placeholder, cta }`

## services (collection CRUD + list-page settings)
- Doc `services/settings`: `{ badge, headingLead, headingItalic, subcopy, seoTitle, seoDescription }`
- Collection `services`: `{ slug, title, shortDescription, icon, heroHeadline, heroHeadlineItalic, heroSubcopy, benefits:[{title,description}], features:[string], workflow:[{title,description}], technologies:[string], pricingCta:{heading,body,cta}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  (icon ∈ web, app, seo, email, social, webapp, wordpress, uiux)

## team (collection CRUD + list-page settings)
- Doc `team/settings`: `{ badge, headingLead, headingItalic, subcopy, seoTitle, seoDescription }`
- Collection `team`: `{ slug, name, role, department, image(=imageUrl), imagePath, bio, experience, skills:[string], social:{linkedin,twitter,instagram,dribbble}, order, active }`

## blog (collection CRUD + list-page settings)
- Doc `blog/settings`: `{ badge, headingLead, headingItalic, subcopy, seoTitle, seoDescription }`
- Collection `blogArticles`: `{ slug, title, image(=imageUrl), imagePath, excerpt, content:[string](paragraphs), category, author(team slug), date(YYYY-MM-DD), readingTime, tags:[string], coverGradient, order, active }`

## testimonials (collection CRUD)
- Collection `testimonials`: `{ quote, name, role, company, rating(1-5 number), order, active }`

## faq (collection CRUD)
- Collection `faqs`: `{ question, answer, order, active }`

## portfolio (collection CRUD)
- Collection `portfolio`: `{ slug, title, category, summary, results:[string], order, active }`

## about-us (settings docs + values collection, one page)
- Doc `about/hero`: `{ badge, headingLead, headingItalic, headingTail, intro }`
- Doc `about/story`: `{ paragraphs:[string] }`
- Doc `about/values`: `{ eyebrow, heading, headingItalic }` + Collection `aboutValues`: `{ title, description, icon, order, active }` (icon ∈ hand, compass, house, heart)
- Doc `about/selectedWork`: `{ eyebrow, heading, headingItalic }` (cards come from the shared portfolio collection)
- Doc `about/closing`: `{ quote, ctaLabel, ctaHref }`

## contact-us (settings doc + leads)
- Doc `contact/settings`: `{ badge, headingLead, headingItalic, subcopy, office:{name, addressLine1, addressLine2, mapEmbedPlaceholder}, phone, email, businessHours:[{days,hours}], social:{instagram,linkedin,twitter,dribbble,pinterest}, budgetRanges:[string], projectTypes:[string], hqHeading, hoursHeading }`
- Collection `contactLeads` (anonymous create, admin read/manage): `{ name, email, projectType, budget, message, status(new), createdAt }`
- Collection `newsletterEmails` (anonymous create, admin read/manage): `{ email, source, status(new), createdAt }`

## policy (single doc, inline sections array)
- Doc `policy/privacy`: `{ hero:{eyebrow,title,body}, sections:[{title,body}], contactHeading, contactIntro, lastUpdated }`

## term-condition (single doc, inline sections array)
- Doc `terms/terms`: `{ hero:{eyebrow,title,body}, sections:[{title,body}], contactHeading, contactIntro, lastUpdated }`
