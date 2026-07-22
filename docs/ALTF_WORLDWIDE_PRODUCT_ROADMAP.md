# AltFTool Worldwide Product Roadmap

Status: active local implementation. This document is the human-readable companion to `@altftool/core/products` and `@altftool/core/product-suites`, which are the machine-readable sources used by the applications.

## Current implementation

The public `/products` directory is the canonical entry point for the product layer. Each suite route is statically generated from the shared registry and uses the same status vocabulary as the admin Product Control Center.

- Live local workspaces: IdeaLab, Minutes, Authenticator, NetCheck, Security, Career, Creator, and Developer.
- Beta workspaces: DomainOps, Flow, Impact, and Campus. Beta labels are intentional where external data breadth, integrations, or country coverage still need expansion.
- Security-gated workspace: Vault. The route explains the gate and does not accept or persist credentials.
- Existing products such as Tools, Signals, Verdict, Learn, PDF Studio, Image Studio, and Growth Engine retain their established routes.
- The suite catalog links only to registered working tool routes. Registry tests fail when a related tool link is unknown.

Idea scoring, transcript analysis, text workflows, network calculations, and TOTP generation are shared pure utilities in `@altftool/core/product-utilities`. DomainOps and NetCheck use bounded, rate-limited server routes. Authenticator and Flow keep sensitive or transient work in the browser.

## Product principles

- Build working products, not thin SEO pages or non-functional demos.
- Consolidate existing features before creating duplicate routes.
- Use the shared design system and support light and dark themes.
- Keep server cost predictable through caching, scheduled jobs, and local processing where practical.
- Publish evidence, source, freshness, methodology, and uncertainty with every trend, comparison, or recommendation.
- Never store passwords or TOTP secrets without an independently reviewed security architecture.
- Develop and verify locally; push or deploy only after explicit approval.

## Delivery phases

### Foundation

1. AltF Platform Core: route quality, tool registry, API health, accessibility, performance, and release gates.
2. AltF Growth Engine: original content, technical SEO, structured data, indexing, localization, and analytics.

### Discover

1. AltF Tools: the canonical tool directory.
2. AltF Signals: trend and opportunity discovery.
3. AltF IdeaLab: validation, market sizing, competition, MVP, and launch planning.
4. AltF DomainOps: DNS, email, SSL, WHOIS, uptime, and domain health.
5. AltF Minutes: transcripts, decisions, action items, and exports.
6. AltF Verdict: transparent comparisons, ratings, and buying guides.
7. AltF Learn: original guides and research linked to working products.

### Expand

AltF Security, Authenticator, NetCheck, PDF Studio, Image Studio, Career, Creator, and Developer.

### Platform

AltF Flow, AltF Impact, AltF Campus, and AltF API & Widgets.

AltF Impact starts with an official-source directory for India, the United States, United Kingdom, Canada, and Australia at `/products/impact`. Dedicated country routes remain a later milestone and require localized eligibility logic, currency and unit handling, source dates, and clear disclaimers before launch.

### Security gated

AltF Vault remains gated until its zero-knowledge design, cryptography, recovery model, extension surface, telemetry, and incident process pass an independent review.

## Traffic engine

Each product should create a useful loop: discover a signal, validate the need, use a tool, read a guide, save or share the result, and return for an alert. Distribution features include shareable reports, embeddable widgets, browser extensions, public APIs, newsletters, country editions, comparison pages, templates, and original benchmark reports.

Every indexable page must provide unique utility. Empty filters, duplicate category variants, generated filler, unavailable tools, and unverified data stay out of search. Metadata, canonical URLs, structured data, internal links, sitemaps, IndexNow, Core Web Vitals, accessibility, and Search Console monitoring are release requirements rather than post-launch tasks.

## Next build order

1. Connect Signals to IdeaLab with explicit user-controlled imports.
2. Add exportable DomainOps reports, uptime history, and security-header checks.
3. Add reviewed external connectors, retries, and encrypted credentials to Flow.
4. Expand Impact into verified country-specific eligibility journeys.
5. Add authenticated project history only after retention and deletion controls are defined.
6. Deliver the remaining traffic-first tool backlog without duplicate or thin routes.
7. Keep Vault gated until the independent security review is complete.

## Local verification

Run from the repository root:

```bash
node --test tests/product-registry.test.mjs tests/route-loading-files.test.mjs
npm --prefix altftoolweb run build -- --webpack
npm --prefix altftoolwebadmin run build -- --webpack
```

Before release, exercise every suite workspace at `/products`, verify DomainOps and NetCheck failure limits, check both color themes and mobile widths, and run the repository release doctor. Push and deployment remain explicit release actions, not part of local feature work.
