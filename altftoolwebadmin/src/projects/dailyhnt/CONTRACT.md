# DailyHnt Admin — Firestore Data Contract

Every module writes to `projects/dailyhnt/...`. The public DailyHnt site reads
these exact paths/fields (see `DailyHnt/lib/content.js` + `firestoreRest.js`).
**Field names below are authoritative — do not rename them.**

Conventions (match `src/projects/carrerbook/modules/team/`):
- `const PROJECT_ID = "dailyhnt";`
- Singleton docs: `setDoc(doc(db, ...PATH), {...fields, updatedAt: serverTimestamp()}, { merge: true })`, read via `onSnapshot` merged over a `DEFAULT_*`.
- Collections: `addDoc/updateDoc/deleteDoc`, every doc has numeric `order` + boolean `active` (default true via `!== false`), read `orderBy("order","asc")`.
- Images: upload to `projects/dailyhnt/<module>/<slot>-<Date.now()>.<ext>`, store paired `imageUrl` + `imagePath` (frontend reads `imageUrl`, also accepts `src`).
- Page: `"use client"`, gray/white theme, `emitAlert` from `@/lib/alertBus`, `DeleteConfirmModal` from `@/components/ui/DeleteConfirmModal`, shared `Field`/`inputClass`/`textareaClass` primitives, settings form + list table + add/edit modal, all on ONE page (route key `""`).

---

## navbar
- Doc `navbar/settings`: `{ cta: { label, href } }`
- Collection `navbarPrimary`: `{ label, href, hasMegaMenu(bool), order, active }`
- Collection `navbarServices` (mega-menu): `{ slug, title, description, icon, order, active }` (icon = one of: code, device, search, mail, share, terminal, layers, grid)

## footer
- Doc `footer/settings`: `{ description }`
- Collection `footerQuickLinks`: `{ label, href, order, active }`
- Collection `footerResources`: `{ label, href, order, active }`

## site-settings
- Doc `settings/site`: `{ name, logoText, logoShort, tagline, description, url, contactEmail, contactPhone, social: { twitter, github, linkedin, dribbble }, seo: { titleTemplate, defaultTitle, description, keywords[] } }`

## home (multi-section, one page with a card per section)
- Doc `home/hero`: `{ eyebrow, headline, subcopy, primaryCta:{label,href}, secondaryCta:{label,href}, meta[](string[]), image(url) }`
- Doc `home/trustedLogos`: `{ label }` + Collection `homeTrustedLogos`: `{ name, src(=imageUrl), imagePath, order, active }`
- Doc `home/stats`: `{ label }` + Collection `homeStats`: `{ value(number), prefix, suffix, label, order, active }`
- Doc `home/aboutTeaser`: `{ eyebrow, headline, body, points[](string[]), cta:{label,href} }`
- Doc `home/whyChooseUs`: `{ eyebrow, headline, image(url) }` + Collection `homeWhyReasons`: `{ title, description, order, active }`
- Doc `home/cta`: `{ eyebrow, headline, body, primaryCta:{label,href}, secondaryCta:{label,href} }`
- Doc `home/newsletter`: `{ eyebrow, headline, body, placeholder, cta }`

## services (collection CRUD, modal editor)
- Collection `services`: `{ slug, number, icon, title, shortDescription, heroHeadline, heroSubcopy, benefits:[{title,description}], features:[string], workflow:[{step,title,description}], technologies:[string], pricingCta:{headline,body}, faq:[{question,answer}], relatedSlugs:[string], order, active }`
  - icon = one of: code, device, search, mail, share, terminal, layers, grid
  - string[] fields edited as textarea (one per line); object[] fields as repeaters.

## team (collection CRUD, modal editor)
- Collection `team`: `{ slug, name, image(=imageUrl), imagePath, role, department, bio, experience, skills:[string], social:{twitter,linkedin,github,dribbble}, order, active }`

## blog (collection CRUD, modal editor)
- Collection `blogArticles`: `{ slug, title, image(=imageUrl), imagePath, excerpt, category, author(team slug), date(YYYY-MM-DD), readingTime, tags:[string], content:[string](paragraphs, textarea split on blank lines), relatedSlugs:[string], order, active }`
- Collection `blogCategories`: `{ name, order, active }`

## testimonials (collection CRUD, modal editor)
- Collection `testimonials`: `{ quote, name, role, company, rating(1-5 number), order, active }`

## faq (collection CRUD, modal editor)
- Collection `faqs`: `{ question, answer, order, active }`

## about-us (settings docs + principles collection, one page)
- Doc `about/hero`: `{ eyebrow, title, body, image(url) }`
- Doc `about/origin`: `{ eyebrow, title, body, terminalLabel }`
- Doc `about/statBlock`: `{ items:[{value,label}] }` (inline array)
- Doc `about/principles`: `{ eyebrow, title, brand, centerTitle, centerBody }` + Collection `aboutPrinciples`: `{ title, description, order, active }`

## contact-us (settings doc)
- Doc `contact/settings`: `{ office:{name, addressLines[]}, phone, email, supportEmail, businessHours:[{days,hours}], mapEmbedPlaceholder, social:{twitter,github,linkedin,dribbble}, responseTime, departments:[{label,email}] }`

## policy (single doc, inline sections array)
- Doc `policy/privacy`: `{ hero:{eyebrow,title,body}, sections:[{title,body}], contactHeading, contactIntro }`

## term-condition (single doc, inline sections array)
- Doc `terms/terms`: `{ hero:{eyebrow,title,body}, sections:[{title,body}], contactHeading, contactIntro }`
