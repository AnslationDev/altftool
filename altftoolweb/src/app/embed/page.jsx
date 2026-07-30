import Link from "next/link";
import {
  createBreadcrumbJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import { getEmbedCategories, getEmbeddableGroups, getEmbeddableTools } from "./embedRegistry";
import EmbedPicker from "./EmbedPicker";

export async function generateMetadata() {
  // Derived, never hardcoded: the registry decides how many widgets exist.
  const count = getEmbeddableTools().length;
  return createPageMetadata({
    title: "Free Embeddable Widgets — Calculators, Converters & Resizers",
    description: `Add free calculators, developer format converters and exam photo resizers to your website with one copy-paste snippet. ${count} AltFTool widgets — no signup, no API key, fully responsive.`,
    path: "/embed",
    keywords: [
      "free embeddable calculator",
      "website widgets",
      "embed calculator iframe",
      "free widgets for blog",
      "oembed calculator widget",
      "embeddable json converter",
    ],
  });
}

const STEPS = [
  { title: "Pick a widget", text: "Search every AltFTool widget below, or filter by family." },
  {
    title: "Copy the format you need",
    text: "Plain iframe, responsive wrapper, WordPress block, or just the URL — no account, no API key, no build step.",
  },
  {
    title: "Paste it anywhere",
    text: "Works in WordPress, Ghost, Webflow, Notion, plain HTML — anywhere an iframe works.",
  },
];

function getEmbedIntro(count) {
  return `Embed any of ${count} AltFTool widgets with a single copy-paste snippet. Free to embed, responsive, available in light and dark themes, and no signup required — just keep the small "Widget by AltFTool" credit visible.`;
}

/**
 * How many widgets the picker gets up front.
 *
 * Sending the whole index as props put about 160 KiB of JSON in this page's
 * initial payload — on the one page whose job is to turn a visitor into an
 * embed. The seed is spread across the source families so every family is
 * visible immediately, and the picker fetches /api/embed-index the moment
 * someone searches or filters past it.
 */
const PICKER_SEED_PER_GROUP = 16;

export default function EmbedHubPage() {
  const groups = getEmbeddableGroups();
  const allTools = getEmbeddableTools();
  const seedIds = new Set(
    groups.flatMap((group) =>
      allTools
        .filter((tool) => tool.source === group.key)
        .slice(0, PICKER_SEED_PER_GROUP)
        .map((tool) => tool.id),
    ),
  );
  // Filtered from the sorted list rather than concatenated, so the seed arrives
  // in the same alphabetical order the full index will replace it with.
  const seedTools = allTools.filter((tool) => seedIds.has(tool.id));
  const intro = getEmbedIntro(allTools.length);

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id="embed-hub-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Embeddable widgets", path: "/embed" },
          ]),
          createHowToJsonLd({
            path: "/embed",
            name: "How to add an AltFTool widget to your website",
            description: intro,
            steps: STEPS.map((step) => `${step.title}: ${step.text}`),
          }),
        ]}
      />
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 lg:px-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Free widgets for your website
          </h1>
          <p className="mt-3 text-base leading-7 text-(--muted-foreground)">
            {intro}
          </p>
        </header>

        <section aria-labelledby="embed-families-heading" className="mt-8">
          <h2 id="embed-families-heading" className="sr-only">
            Widget families
          </h2>
          {/* Counts come from the registry, never from a literal in this file. */}
          <ul className="grid gap-3 md:grid-cols-3">
            {groups.map((group) => (
              <li
                key={group.key}
                className="flex flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4"
              >
                <p className="text-2xl font-bold tracking-tight text-(--primary-text)">
                  {group.count}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{group.label}</h3>
                <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">{group.blurb}</p>
                {/* Plain examples, taken in name order — not a popularity or
                    usage ranking, which we have no data for. */}
                <p className="mt-3 text-xs font-semibold text-(--muted-foreground)">For example:</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.examples.map((example) => (
                    <li key={example.id}>
                      <Link
                        href={`/embed/widget/${example.id}`}
                        className="inline-flex rounded-full border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transition-none"
                      >
                        {example.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-(--primary-soft) text-sm font-bold text-(--primary-text)">
                {index + 1}
              </span>
              <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">{step.text}</p>
            </li>
          ))}
        </ol>

        <section aria-label="Widget picker" className="mt-10">
          <EmbedPicker
            seedTools={seedTools}
            totalCount={allTools.length}
            indexUrl="/api/embed-index"
            categories={getEmbedCategories()}
            baseUrl={PRODUCTION_SITE_URL}
          />
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">Paste the URL, skip the HTML</h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Every widget page publishes an{" "}
            <a
              href="https://oembed.com/"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-[4px] font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            >
              oEmbed
            </a>{" "}
            endpoint, so editors that resolve oEmbed can turn a pasted widget URL straight into the
            live widget — no HTML block, no code view. Self-hosted WordPress does this for authors
            allowed to post unfiltered HTML; Ghost resolves it in its embed card. Discourse needs
            an admin to allowlist{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              altftool.com
            </code>{" "}
            in its onebox settings first. Anywhere else, the HTML snippet still works.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Building your own integration? Call{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              /api/oembed?url=&hellip;
            </code>{" "}
            with a widget URL — or with the public page it came from, whether that is a{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              /tools
            </code>
            ,{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              /transform
            </code>{" "}
            or{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              /exam-photo
            </code>{" "}
            page — and you get back a standard JSON oEmbed response, including
            the ready-to-inject <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">html</code>.
            It accepts <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">maxwidth</code>{" "}
            and <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">maxheight</code>.
          </p>
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">Fair use</h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Widgets are free for personal and commercial sites. The attribution link inside the
            widget and the credit line in the snippet must stay visible so visitors can identify
            the widget&rsquo;s source.
          </p>
          {/*
            Accuracy matters more than the pitch here. Three different things are
            true across the families, so all three are stated: most widgets
            compute locally, a few fetch live data, and the /transform
            converters that need a Node-only library send the pasted input to
            AltFTool for that one request. Never compress this into "nothing
            ever leaves the browser".
          */}
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Most widgets compute in your visitor&rsquo;s browser — the exam photo and signature
            resizers, for instance, never upload the file at all. A few need live data: the currency
            converter fetches exchange rates from AltFTool. And about half the developer format
            converters run on a Node-only library, so those send the pasted input to AltFTool to
            convert it and hand the result straight back — each of those carries a &ldquo;Runs in
            your browser&rdquo; or &ldquo;Runs on server&rdquo; badge on its own face, so a reader
            can see which one they are using.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            <strong className="font-semibold text-(--foreground)">Tip:</strong> widgets follow the
            visitor&rsquo;s system theme by default. To pin one, append{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              ?theme=dark
            </code>{" "}
            or{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              ?theme=light
            </code>{" "}
            to the iframe URL.
          </p>
        </section>
      </div>
    </main>
  );
}
