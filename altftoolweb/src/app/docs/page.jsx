import Link from "next/link";
import {
  Accessibility,
  Activity,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Compass,
  ExternalLink,
  FileSearch,
  FlaskConical,
  Globe2,
  LayoutGrid,
  LockKeyhole,
  MonitorSmartphone,
  Palette,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
  Workflow,
} from "lucide-react";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_GROUPS,
} from "@altftool/core/experiences";
import {
  PRODUCT_SUITE_CATALOG,
  PRODUCT_SUITE_STATUSES,
} from "@altftool/core/product-suites";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { PUBLIC_ROUTE_FAMILIES } from "@/platform/navigation/publicRouteTaxonomy";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";
import { CANONICAL_CATEGORIES } from "@/platform/registry/categoryTaxonomy";

import {
  DOCS_AUTOMATION_LINKS,
  DOCS_BUSINESS_LINKS,
  DOCS_FAQS,
  DOCS_LAST_REVIEWED,
  DOCS_PRIVACY_POINTS,
  DOCS_QUICK_LINKS,
  DOCS_SECTIONS,
} from "./docsContent";

export const metadata = createPageMetadata({
  title: "AltFTool Documentation",
  description:
    "The public guide to AltFTool products, browser tools, automation workflows, business services, privacy, accessibility, support, and platform navigation.",
  path: "/docs",
  keywords: [
    "AltFTool documentation",
    "AltFTool guide",
    "online tools help",
    "AltFTool products",
    "AltFTool privacy",
    "AltFTool support",
  ],
});

const FAMILY_ICONS = {
  platform: LayoutGrid,
  tools: Wrench,
  automation: Workflow,
  business: BriefcaseBusiness,
  commerce: ShoppingBag,
  learn: BookOpenCheck,
  experiences: FlaskConical,
  support: CircleHelp,
};

const QUICK_LINK_ICONS = {
  tools: Wrench,
  products: LayoutGrid,
  automation: Workflow,
  business: BriefcaseBusiness,
  learn: BookOpenCheck,
  directory: FileSearch,
};

const ACCOUNT_POINTS = [
  "Public browsing and many tools work without signing in.",
  "Protected or saved experiences may require an authenticated account.",
  "Theme preference can follow the operating system or use a light or dark override.",
  "Browser storage may preserve preferences or local work for supported features.",
  "Clearing browser data can remove locally saved preferences and unfinished local work.",
];

const ACCESSIBILITY_POINTS = [
  {
    icon: Accessibility,
    title: "Keyboard and focus",
    description:
      "Navigation, dialogs, menus, and core controls are designed for keyboard use with visible focus states.",
  },
  {
    icon: Palette,
    title: "Light, dark, and system",
    description:
      "The same semantic design tokens support all three theme choices without changing content meaning.",
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive layouts",
    description:
      "Public routes adapt to mobile and desktop viewports, with appropriately sized interactive targets.",
  },
  {
    icon: Sparkles,
    title: "Motion preferences",
    description:
      "Non-essential animation is reduced when the browser requests reduced motion.",
  },
];

const SUPPORT_LINKS = [
  {
    title: SITE_ROUTES.support.label,
    description:
      "Troubleshoot common issues and open the public support center.",
    href: SITE_ROUTES.support.href,
  },
  {
    title: SITE_ROUTES.status.label,
    description: "Review public route, content, and service health.",
    href: SITE_ROUTES.status.href,
  },
  {
    title: SITE_ROUTES.requestTool.label,
    description:
      "Suggest a utility, workflow, or feature for the public library.",
    href: SITE_ROUTES.requestTool.href,
  },
  {
    title: SITE_ROUTES.siteMap.label,
    description: "Search and browse every indexed public AltFTool route.",
    href: SITE_ROUTES.siteMap.href,
  },
  {
    title: SITE_ROUTES.contact.label,
    description: "Find the public contact route for questions and notices.",
    href: SITE_ROUTES.contact.href,
  },
  {
    title: SITE_ROUTES.privacy.label,
    description: "Review privacy practices and related policy information.",
    href: SITE_ROUTES.privacy.href,
  },
];

function SectionHeading({ description, eyebrow, id, title }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase text-primary">{eyebrow}</p>
      <h2
        className="mt-2 scroll-mt-24 text-2xl font-bold text-foreground"
        id={id}
      >
        {title}
      </h2>
      <p className="mt-2 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

function TextLink({ children, href }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-semibold text-primary transition hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      href={href}
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

function LinkCollection({ links }) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {links.map((item) => (
        <Link
          className="group flex min-h-28 items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href={item.href}
          key={item.href}
        >
          <span>
            <span className="block text-base font-semibold text-foreground group-hover:text-primary">
              {item.title}
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              {item.description}
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </Link>
      ))}
    </div>
  );
}

export default function DocsPage() {
  const routeFamilies = PUBLIC_ROUTE_FAMILIES.filter(
    (family) => family.id !== "other",
  );
  const experienceGroups = Object.values(EXPERIENCE_GROUPS).map((group) => ({
    ...group,
    total: EXPERIENCE_CATALOG.filter(
      (experience) => experience.group === group.id,
    ).length,
  }));

  return (
    <main className="bg-background text-foreground" id="main-content">
      <JsonLd
        id="altftool-docs-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/docs",
            name: "AltFTool Documentation",
            description:
              "The public guide to AltFTool products, tools, workflows, services, privacy, accessibility, and support.",
          }),
          createItemListJsonLd({
            path: "/docs",
            name: "AltFTool documentation sections",
            items: DOCS_SECTIONS.map((section) => ({
              name: section.label,
              path: `/docs#${section.id}`,
            })),
          }),
          createFaqJsonLd({
            path: "/docs",
            questions: DOCS_FAQS,
          }),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Documentation", path: "/docs" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-card">
        <div className="section mx-auto py-10 sm:py-14 lg:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              className="rounded-sm font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href="/"
            >
              AltFTool
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Documentation</span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <span className="inline-flex min-h-8 items-center gap-2 rounded-pill border border-border bg-muted px-3 text-xs font-semibold uppercase text-primary">
              <BookOpenCheck aria-hidden="true" className="h-4 w-4" />
              Public platform guide
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Understand AltFTool, then get to the right destination quickly.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              This is the canonical public guide to AltFTool products, browser
              tools, automation, business services, discovery, data handling,
              accessibility, and support.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href="#start"
              >
                Start with a task
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href="/site-map"
              >
                Open site map
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
            {[
              ["Product workspaces", PRODUCT_SUITE_CATALOG.length],
              ["Tool categories", CANONICAL_CATEGORIES.length],
              ["Public route families", routeFamilies.length],
              ["Interactive experiences", EXPERIENCE_CATALOG.length],
            ].map(([label, value]) => (
              <div className="bg-background p-4" key={label}>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Last reviewed {DOCS_LAST_REVIEWED}. Public features can evolve; use
            the Status page for current service health.
          </p>
        </div>
      </section>

      <div className="section mx-auto grid gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details className="group rounded-lg border border-border bg-card lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              On this page
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground transition group-open:rotate-180"
              />
            </summary>
            <ol className="border-t border-border px-2 py-2">
              {DOCS_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={`#${section.id}`}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <nav aria-label="Documentation sections" className="hidden lg:block">
            <h2 className="text-xs font-semibold uppercase text-muted-foreground">
              On this page
            </h2>
            <ol className="mt-3 border-l border-border">
              {DOCS_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    className="flex min-h-10 items-center border-l-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={`#${section.id}`}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-6 hidden border-t border-border pt-5 lg:block">
            <p className="text-sm font-semibold text-foreground">Need help?</p>
            <div className="mt-2 flex flex-col items-start">
              <TextLink href="/supportsetting">Open support</TextLink>
              <TextLink href="/status">Check status</TextLink>
            </div>
          </div>
        </aside>

        <article className="min-w-0">
          <section aria-labelledby="overview">
            <SectionHeading
              description="AltFTool groups related destinations into clear product families instead of asking you to remember hundreds of URLs."
              eyebrow="01 · Foundation"
              id="overview"
              title="One platform, organized by the job you need to finish"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {routeFamilies.map((family) => {
                const Icon = FAMILY_ICONS[family.id] || Compass;
                return (
                  <Link
                    className="group flex min-h-36 flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={family.href}
                    key={family.id}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">
                      {family.title}
                    </span>
                    <span className="mt-1 text-sm leading-6 text-muted-foreground">
                      {family.description}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border-l-4 border-primary bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                Public documentation boundary
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This guide documents user-facing behavior and public routes. It
                intentionally does not publish credentials, private admin
                workflows, security-sensitive implementation details, or
                unreleased internal plans.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="start"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="Pick the closest outcome. Each destination keeps related tools and next steps together."
              eyebrow="02 · Getting started"
              id="start"
              title="Start with what you want to do"
            />

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {DOCS_QUICK_LINKS.map((item) => {
                const Icon = QUICK_LINK_ICONS[item.icon] || Compass;
                return (
                  <Link
                    className="group flex min-h-44 flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={item.href}
                    key={item.href}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </span>
                    <span className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="products"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="Product workspaces combine related tools into a guided surface. Status and privacy notes come from the canonical product catalog."
              eyebrow="03 · Workspaces"
              id="products"
              title="AltF products"
            />

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {PRODUCT_SUITE_CATALOG.map((suite) => (
                <article
                  className="flex min-h-64 flex-col rounded-lg border border-border bg-card p-4 shadow-sm"
                  key={suite.slug}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-primary">
                        {suite.eyebrow}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        {suite.name}
                      </h3>
                    </div>
                    <span className="inline-flex min-h-7 items-center rounded-pill border border-border bg-muted px-2.5 text-xs font-semibold text-muted-foreground">
                      {PRODUCT_SUITE_STATUSES[suite.status] || suite.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {suite.description}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {suite.capabilities.map((capability) => (
                      <li
                        className="flex items-start gap-2 text-sm text-foreground"
                        key={capability}
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        />
                        {capability}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                    <LockKeyhole
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    />
                    {suite.privacy}
                  </p>

                  <div className="mt-auto pt-4">
                    <TextLink href={`/products/${suite.slug}`}>
                      Open {suite.name.replace(/^AltF\s+/, "")}
                    </TextLink>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="tools"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="The canonical category catalog keeps discovery consistent across the tool directory, search, navigation, and site map."
              eyebrow="04 · Utilities"
              id="tools"
              title="Browser tools and data processing"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {CANONICAL_CATEGORIES.map((category) => (
                <Link
                  className="group flex min-h-24 items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  href={`/tools/${category.slug}`}
                  key={category.slug}
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                      {category.label}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                      {category.description}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: LockKeyhole,
                  title: "Check the privacy note",
                  description:
                    "Local and remote processing can differ by tool, even inside the same category.",
                },
                {
                  icon: Search,
                  title: "Use global search",
                  description:
                    "Search names, descriptions, categories, guides, products, and public route paths.",
                },
                {
                  icon: Activity,
                  title: "Expect provider limits",
                  description:
                    "Live-data and API-backed tools can be affected by quotas, availability, and network conditions.",
                },
              ].map(({ description, icon: Icon, title }) => (
                <div className="border-t border-border pt-4" key={title}>
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="automation"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="Use the workflow library for ready-made automation, then move to focused apps or local workflow building when the task requires it."
              eyebrow="05 · Connected work"
              id="automation"
              title="Automation, prompts, extensions, and software"
            />
            <LinkCollection links={DOCS_AUTOMATION_LINKS} />
          </section>

          <section
            aria-labelledby="business"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="AltFTool also organizes service discovery, shopping research, learning, and interactive experiences. These destinations may link to external providers or merchants."
              eyebrow="06 · Explore"
              id="business"
              title="Business, shopping, learning, and discovery"
            />
            <LinkCollection links={DOCS_BUSINESS_LINKS} />

            <div className="mt-6 border-y border-border py-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Labs by experience type
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {EXPERIENCE_CATALOG.length} public experiences are organized
                    into three clear groups.
                  </p>
                </div>
                <TextLink href="/labs">Browse all labs</TextLink>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {experienceGroups.map((group) => (
                  <div className="bg-muted p-4" key={group.id}>
                    <dt className="text-sm font-semibold text-foreground">
                      {group.label}
                    </dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {group.total} experiences
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section
            aria-labelledby="accounts"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="AltFTool keeps the public experience usable without unnecessary account gates while allowing protected or saved workflows where required."
              eyebrow="07 · Personalization"
              id="accounts"
              title="Accounts, saved state, and preferences"
            />
            <ul className="mt-6 space-y-3">
              {ACCOUNT_POINTS.map((point) => (
                <li
                  className="flex items-start gap-3 text-sm leading-6 text-foreground"
                  key={point}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-primary"
                  />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
              <TextLink href="/account">Open account</TextLink>
              <TextLink href="/supportsetting">Open preferences</TextLink>
            </div>
          </section>

          <section
            aria-labelledby="privacy"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="Data handling is feature-specific. Read the page-level privacy note and do not submit sensitive information unless the workflow clearly supports it."
              eyebrow="08 · Trust"
              id="privacy"
              title="Privacy, safety, advertising, and limitations"
            />

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {DOCS_PRIVACY_POINTS.map((point) => (
                <article
                  className="min-h-40 rounded-lg border border-border bg-card p-4 shadow-sm"
                  key={point.title}
                >
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-5 w-5 text-primary"
                  />
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {point.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
              <TextLink href="/policypages/privacy">Privacy policy</TextLink>
              <TextLink href="/policypages/cookie">Cookie policy</TextLink>
              <TextLink href="/policypages/affiliate">
                Affiliate disclosure
              </TextLink>
              <TextLink href="/policypages/disclaimer">Disclaimer</TextLink>
            </div>
          </section>

          <section
            aria-labelledby="accessibility"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="The shared AltFTool design system provides a consistent accessibility baseline across public products and admin-managed content."
              eyebrow="09 · Inclusive use"
              id="accessibility"
              title="Accessibility and display preferences"
            />

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {ACCESSIBILITY_POINTS.map(
                ({ description, icon: Icon, title }) => (
                  <article
                    className="min-h-40 rounded-lg border border-border bg-card p-4 shadow-sm"
                    key={title}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </section>

          <section
            aria-labelledby="support"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="Start with status for a suspected outage, support for a problem, and the request route for a new public feature."
              eyebrow="10 · Help"
              id="support"
              title="Support, reliability, and public policies"
            />
            <LinkCollection links={SUPPORT_LINKS} />

            <div className="mt-6 flex items-start gap-3 border-l-4 border-primary bg-muted p-4">
              <Globe2
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Third-party destinations
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  External APIs, merchants, publishers, maps, media, and service
                  providers control their own availability, terms, pricing, and
                  privacy practices. Review the destination before continuing.
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="faq"
            className="mt-14 border-t border-border pt-10"
          >
            <SectionHeading
              description="These answers summarize the public platform contract. Policy pages control where a legal term requires more detail."
              eyebrow="11 · Answers"
              id="faq"
              title="Frequently asked questions"
            />

            <div className="mt-6 divide-y divide-border border-y border-border">
              {DOCS_FAQS.map((item) => (
                <details className="group" key={item.question}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="text-lg text-primary transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-3xl pb-4 text-sm leading-6 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href="/supportsetting"
              >
                Open support
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href="/request-a-tool"
              >
                Request a tool
                <Wrench aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
