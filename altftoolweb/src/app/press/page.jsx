/**
 * /press — the media kit.
 *
 * HARD RULE FOR ANYONE EDITING THIS PAGE: every fact here is either read out of
 * a registry at render time or quoted from something the site already publishes
 * elsewhere. Nothing on this page is typed in from memory.
 *
 * That is not pedantry. A media kit is the one page a journalist copies
 * verbatim, so an invented figure here becomes an invented figure in print with
 * a citation pointing back at us. The site has NOT published a founding date,
 * a legal entity, a headcount, funding, revenue, traffic, awards or press
 * mentions — so this page does not either. It says so out loud in the
 * "Not published here" section instead of guessing, and that section is the
 * correct place to send anyone who needs those numbers.
 */

import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createOrganizationJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { getAnswerEngineSnapshot } from "@/platform/seo/answerEngineManifest";
import { TOOLS as TRANSFORM_TOOLS } from "@/app/transform/_lib/manifest";
import { EXAM_SPECS, SPECS_READ_ON } from "@/app/exam-photo/data/examSpecs";

export const dynamic = "force-static";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Press & Media Kit",
    description:
      "Boilerplate, logo files, brand colours, live section counts and contact details for journalists writing about AltFTool — plus the things AltFTool is not, so a correction is never needed.",
    path: "/press",
    keywords: [
      "AltFTool press kit",
      "AltFTool media kit",
      "AltFTool logo",
      "AltFTool boilerplate",
      "AltFTool brand assets",
    ],
  });
}

/**
 * The email every policy page on this site publishes. Read from one constant so
 * a change to the published address is a one-line change, not a hunt.
 * Verified in src/app/policypages/{contact,privacy,cookie,affiliate,
 * disclaimer,termsandconditions}.
 */
const PUBLISHED_CONTACT_EMAIL = "altftool@gmail.com";

/** Only files that exist in public/. Sizes and dimensions were measured. */
const BRAND_ASSETS = [
  {
    path: "/brand/altftool-mark.svg",
    label: "Brand mark (SVG)",
    detail:
      "Vector, teal-to-cyan gradient, scales to any size. This is the mark the site header and footer render, generated from the same brand source as the live component. Use it for avatars, favicons and anywhere the logo has to scale.",
  },
  {
    path: "/assets/logo3.png",
    label: "Wordmark (PNG, 366 × 192)",
    detail:
      "The raster wordmark AltFTool publishes as its logo in its own Organization structured data. It predates the current teal/cyan mark and is drawn in blue, so pick one or the other for a given layout rather than mixing them.",
  },
  {
    path: "/assets/og-default.png",
    label: "Social preview card (PNG, 1200 × 630)",
    detail:
      "The default Open Graph image. Correctly sized for a social embed; not intended as a logo.",
  },
];

/** From packages/ui/src/brand/brand.js, which generates the mark itself. */
const BRAND_COLOURS = [
  ["Primary", "Teal-500", "#14B8A6", "Brand identity colour — the first stop of the mark gradient."],
  ["Secondary", "Cyan-400", "#22D3EE", "The second stop of the mark gradient."],
];

const DESCRIBE_US = [
  "The name is one word: AltFTool. That is the form the site uses in its own metadata and structured data.",
  "First mention: AltFTool (altftool.com). After that, AltFTool alone is fine.",
  "A free, browser-based online tools site — utilities, converters, calculators, PDF and image workflows, privacy and security helpers, guides and browser games.",
  "Most tools run in the visitor's own browser. Say \"runs in your browser\" only for a tool whose page says so; some tools do call an API, and each page discloses which.",
  "Primary language is English. A number of pages carry Hindi or Hinglish-friendly wording, and the site's own structured data lists English and Hindi as its support languages.",
];

const DO_NOT_DESCRIBE_US = [
  {
    wrong: "A bank, a payment provider or any kind of financial institution.",
    right:
      "Some tools help people inspect a payment request, a UPI collect prompt or a merchant QR code for signs of fraud. They inspect; they never move money, and there is no account or wallet.",
  },
  {
    wrong:
      "A government body, or affiliated with any exam-conducting body — SSC, IBPS, SBI, UPSC, the Railway Recruitment Boards or the NTA.",
    right:
      "The exam pages quote each body's own public notification, name the document and the date printed on it, and link it so a reader can check. AltFTool has no role in any recruitment or entrance process.",
  },
  { wrong: "A medical provider, or a source of medical advice.", right: "" },
  {
    wrong: "A legal authority, or a source of legal advice.",
    right:
      "Tools that draft a policy, a notice or an agreement are drafting aids. A lawyer still has to read the output.",
  },
  {
    wrong: "A guarantee of anything.",
    right:
      "Privacy, redaction, scam-triage, accessibility and security tools are educational and triage helpers. They reduce risk and surface problems; they do not certify that a file is clean or that a message is safe.",
  },
  {
    wrong: "A community, forum or marketplace with real members.",
    right:
      "The /altfworld section is a display-only interface demo. Its members, threads and listings are generated placeholder data, no real person wrote any of it, and every route under it is set to noindex. Nothing there should be quoted as a real discussion or a real listing.",
  },
];

/**
 * Facts a journalist will reasonably ask for that this repository does not
 * assert anywhere — so the page says so rather than inventing them. The
 * Organization structured data leaves founder and founding date empty unless a
 * deployment variable supplies them, which is the same admission in machine
 * form.
 */
const NOT_PUBLISHED_HERE = [
  "Founding date, and the story of how the site started",
  "Legal entity name, registration number and registered address",
  "Headcount, and the names or roles of the people behind it",
  "Funding, ownership and revenue",
  "Traffic, user or download figures",
  "Awards, certifications and previous press coverage",
  "A named spokesperson for quotes",
];

function statList({ snapshot }) {
  const format = (value) => Number(value).toLocaleString("en-US");

  return [
    {
      value: format(snapshot.toolCount),
      label: "tools in the registry",
      note: `across ${snapshot.categoryCounts.length} categories`,
    },
    {
      value: format(snapshot.gamesCount),
      label: "browser games",
      note: "counted inside the tool registry, tagged as games",
    },
    {
      value: format(TRANSFORM_TOOLS.length),
      label: "format converters",
      note: "one page each, under /transform",
    },
    {
      value: format(EXAM_SPECS.length),
      label: "exam upload-spec pages",
      note: `each quoted from a named notification, read on ${SPECS_READ_ON}`,
    },
    {
      value: format(snapshot.geoLocationCount),
      label: "location entity pages",
      note: `covering ${format(snapshot.geoCountryCount)} countries`,
    },
  ];
}

export default function PressPage() {
  const site = getSiteUrl();
  const snapshot = getAnswerEngineSnapshot();
  const stats = statList({ snapshot });
  const host = site.replace(/^https?:\/\//, "");

  return (
    <>
      <JsonLd
        id="press-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Press", path: "/press" },
          ]),
          createOrganizationJsonLd(),
        ]}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <span className="text-foreground">Press</span>
        </nav>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Press &amp; media kit
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground">
          Everything you need to write about AltFTool without emailing first:
          boilerplate you can paste, logo files, the section counts, and a short
          list of things AltFTool is not — so nobody has to run a correction.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Every number on this page is read out of the site&apos;s own registries
          when the page is built, not typed in. They move as tools ship, so quote
          them with the date you looked.
        </p>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-boilerplate" className="mt-10">
          <h2
            id="press-boilerplate"
            className="text-xl font-bold text-foreground"
          >
            Boilerplate
          </h2>

          <h3 className="mt-4 text-sm font-semibold text-foreground">
            One line
          </h3>
          {/*
            This used to read "whose utilities, converters and calculators run in
            the browser". 34 of the 64 /transform converters carry
            engine: "server" and POST the pasted input to AltFTool's API, so the
            sentence a journalist was told to print verbatim was false — and it
            contradicted this page's own rule eleven lines above, which says to
            claim "runs in your browser" only for a tool whose page says so.
          */}
          <blockquote className="mt-2 rounded-xl border-l-4 border-primary bg-surface-soft p-4 text-sm leading-relaxed text-foreground">
            AltFTool ({host}) is a free online tools site. Most of its
            utilities do their work on the visitor&apos;s own device; the ones
            that need a server or a model say so on their own page.
          </blockquote>

          <h3 className="mt-5 text-sm font-semibold text-foreground">
            Short paragraph
          </h3>
          <blockquote className="mt-2 rounded-xl border-l-4 border-primary bg-surface-soft p-4 text-sm leading-relaxed text-foreground">
            AltFTool ({host}) is a free online tools site. Its catalog holds{" "}
            {Number(snapshot.toolCount).toLocaleString("en-US")} utilities across{" "}
            {snapshot.categoryCounts.length} categories — PDF and image
            workflows, calculators, privacy and security helpers, and browser
            games — with a further {TRANSFORM_TOOLS.length} developer format
            converters published separately under /transform, alongside guides
            and reference pages such as the photograph and signature upload rules
            for {EXAM_SPECS.length} Indian exams, each quoted from the conducting
            body&apos;s own notification. Most utilities run on the visitor&apos;s
            own device; those that need a server or a model say so on their own
            page.
          </blockquote>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            The site describes itself, in its own metadata, as:{" "}
            <span className="italic">{siteConfig.description}</span>
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-numbers" className="mt-12">
          <h2 id="press-numbers" className="text-xl font-bold text-foreground">
            The site, by section
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <li
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <span className="block text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">
                  {stat.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {stat.note}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Machine-readable versions of the same picture:{" "}
            <a
              href="/llms.txt"
              className="font-medium text-primary hover:underline"
            >
              /llms.txt
            </a>
            ,{" "}
            <a
              href="/ai.txt"
              className="font-medium text-primary hover:underline"
            >
              /ai.txt
            </a>{" "}
            and{" "}
            <a
              href="/sitemap.xml"
              className="font-medium text-primary hover:underline"
            >
              /sitemap.xml
            </a>
            . Two datasets are published as JSON you may republish with
            attribution — see{" "}
            <Link
              href="/open-data"
              className="font-medium text-primary hover:underline"
            >
              open data
            </Link>
            .
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-assets" className="mt-12">
          <h2 id="press-assets" className="text-xl font-bold text-foreground">
            Logos and brand assets
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            These are the files the site itself uses. Open a link to download
            it.
          </p>
          <ul className="mt-4 space-y-3">
            {BRAND_ASSETS.map((asset) => (
              <li
                key={asset.path}
                className="rounded-xl border border-border bg-card p-4"
              >
                <a
                  href={asset.path}
                  className="font-semibold text-primary hover:underline"
                >
                  {asset.label}
                </a>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {asset.path}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {asset.detail}
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-foreground">
            Brand colours
          </h3>
          <ul className="mt-2 space-y-2">
            {BRAND_COLOURS.map(([role, name, hex, note]) => (
              <li key={hex} className="text-sm leading-relaxed">
                <span className="font-medium text-foreground">{role}</span>
                <span className="text-muted-foreground"> — {name}, </span>
                <code className="font-mono text-foreground">{hex}</code>
                <span className="text-muted-foreground">. {note}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-foreground">
            Using them
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Editorial and review use is fine — no permission needed to
              illustrate a story about AltFTool.
            </li>
            <li>
              Please do not recolour, stretch, add effects to, or rebuild the
              mark, and please keep clear space around it.
            </li>
            <li>
              Please do not use the mark in a way that suggests AltFTool endorses
              a product, sponsors an event, or partnered on something it did not.
            </li>
            <li>
              Screenshots of tool pages are fine. If a screenshot shows sample
              data, say so — several tools are built precisely to strip real
              personal data out of files.
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-describe" className="mt-12">
          <h2 id="press-describe" className="text-xl font-bold text-foreground">
            How to describe us
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {DESCRIBE_US.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-foreground">
            And what AltFTool is not
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This list exists because the tools sit next to serious subjects —
            money, exams, health, law — and a one-word slip turns a utility into
            an authority it is not.
          </p>
          <ul className="mt-3 space-y-3">
            {DO_NOT_DESCRIBE_US.map((item) => (
              <li
                key={item.wrong}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  Not: {item.wrong}
                </p>
                {item.right ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.right}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-gaps" className="mt-12">
          <h2 id="press-gaps" className="text-xl font-bold text-foreground">
            Not published here
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            AltFTool has not published the following, so this page does not state
            it and nothing on the site should be read as implying it. If your
            story needs one of these, ask — an unanswered question is better than
            a wrong figure.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            {NOT_PUBLISHED_HERE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="press-contact" className="mt-12">
          <h2 id="press-contact" className="text-xl font-bold text-foreground">
            Contact
          </h2>
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:${PUBLISHED_CONTACT_EMAIL}`}
                className="font-medium text-primary hover:underline"
              >
                {PUBLISHED_CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Contact form:</span>{" "}
              <Link
                href="/policypages/contact"
                className="font-medium text-primary hover:underline"
              >
                {host}/policypages/contact
              </Link>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              This is the same address and form the site publishes on its policy
              pages — there is no separate press line. The contact page says
              replies usually arrive within 24 to 48 hours; treat that as the
              usual case, not a commitment.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Security researchers: the disclosure contact is in{" "}
              <a
                href="/.well-known/security.txt"
                className="font-medium text-primary hover:underline"
              >
                /.well-known/security.txt
              </a>
              .
            </p>
          </div>

          <h3 className="mt-6 text-sm font-semibold text-foreground">
            Official accounts
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            These are the only accounts AltFTool claims as its own. Anything else
            using the name is not connected to the site.
          </p>
          <ul className="mt-2 space-y-1.5">
            {siteConfig.sameAs.map((profile) => (
              <li key={profile} className="text-sm leading-relaxed">
                <a
                  href={profile}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="break-all font-mono text-xs text-primary hover:underline"
                >
                  {profile}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
